import glob, { promise } from "glob-promise";
import path from "path";
import { PathLike, promises as fs } from "fs";
import { fmtDataUrl } from "./src/formatter.js";

/**
 * copies a src file to a dest file, using JSON.parse and JSON.stringify to minify it
 */
const copyJsonMinify = async (src: PathLike, dest: PathLike) => {
  const srcData = await fs.readFile(src, "utf8");
  const destData = JSON.stringify(JSON.parse(srcData));
  await fs.writeFile(dest, destData);
};

/** make globs nicer to write for data dir */
const dataGlob = async (globStr: string) =>
  (await glob(globStr, { cwd: "data" })).map((partialPath) =>
    path.join("data", partialPath)
  );

// ensure out dir exists
try {
  await fs.mkdir("processed_data");
} catch (e) {}

type DataBaseShape = {
  srd?: boolean;
  name: string;
  source: string;
};

const filters = new Map<string, Set<string | number | boolean>>();

const processedData: Array<DataBaseShape & { id: string }> = [];

const processJson = async (paths: string | string[], checkSrd = true) => {
  const iterPaths = Array.isArray(paths) ? paths : [paths];

  await Promise.all(
    iterPaths.map(async (pathOfJson) => {
      const dataTypeDataRecord: Record<string, DataBaseShape[]> = JSON.parse(
        await fs.readFile(pathOfJson, "utf8")
      );
      Object.entries(dataTypeDataRecord).forEach(([type, fileData]) => {
        fileData.forEach((data: DataBaseShape) => {
          if (data.srd === true) {
            const newData = {
              ...data,
              id: fmtDataUrl(type, data.name, data.source),
            };
            processedData.push(newData);
            // build up the filters
            Object.entries(newData).forEach(([key, value]) => {
              if (typeof value === "object") return;
              if (!filters.has(key)) filters.set(key, new Set());
              filters.get(key)!.add(value);
            });
          }
        });
      });
    })
  );
};

await Promise.all([
  processJson(await dataGlob("spells/spells-*.json")),
  processJson("data/conditionsdiseases.json"),
]);

// create map of sets json for filters
await fs.writeFile(
  "processed_data/filters.json",
  JSON.stringify(
    [...filters.entries()].map(([key, value]) => [
      key,
      [...value.entries()].map(([e]) => e),
    ])
  )
);

await fs.writeFile(
  "processed_data/data.json",
  JSON.stringify(processedData.sort((a, b) => a.name.localeCompare(b.name)))
);

// copy renderdemo over
await copyJsonMinify("data/renderdemo.json", "processed_data/renderdemo.json");
