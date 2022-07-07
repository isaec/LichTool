import glob from "glob-promise";
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

// copy spells over
const spells = await dataGlob("spells/spells-*.json");
const processedSpells: {}[] = [];
await Promise.all(
  spells.map(async (spellPath) => {
    const spellFileData = JSON.parse(
      await fs.readFile(spellPath, "utf8")
    ).spell;
    spellFileData.forEach((spell: DataBaseShape) => {
      if (spell.srd === true) {
        processedSpells.push({
          ...spell,
          id: fmtDataUrl("spell", spell.name, spell.source),
        });
        // build up the filters
        Object.entries(spell).forEach(([key, value]) => {
          if (typeof value === "object") return;
          if (!filters.has(key)) filters.set(key, new Set());
          filters.get(key)!.add(value);
        });
      }
    });
  })
);

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
  "processed_data/spells.json",
  JSON.stringify({ spell: processedSpells })
);

// copy renderdemo over
await copyJsonMinify("data/renderdemo.json", "processed_data/renderdemo.json");
