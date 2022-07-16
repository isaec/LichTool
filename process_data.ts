import glob, { promise } from "glob-promise";
import path from "path";
import { PathLike, promises as fs } from "fs";
import { fmtDataUrl } from "@util/formatter";

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
          }
        });
      });
    })
  );
};

type Merge<A, B> = { [K in keyof (A | B)]: K extends keyof B ? B[K] : A[K] };

const deepMerge = <
  T extends Record<string, any>,
  K extends Record<string, any>
>(
  obj1: T,
  obj2: K
): Merge<T, K> => {
  type Key = keyof Merge<T, K>;
  type Val = Merge<T, K>[Key];
  const result: Merge<T, K> = structuredClone(obj1);

  Object.entries(obj2).forEach(([key, value]: [Key, Val]) => {
    switch (true) {
      case Array.isArray(value) === true:
        if (!result[key]) result[key] = value;
        else result[key] = result[key].concat(value);
        break;
      case typeof value === "object":
        if (!result[key]) result[key] = value;
        else result[key] = deepMerge(result[key], value) as Val;
        break;
      default:
        result[key] = value;
    }
  });
  return result;
};

const processItems = async () => {
  const baseItemsFile = await fs.readFile("data/items-base.json", "utf8");
  type Item = DataBaseShape & {
    id: string;
    baseitem: any[];
    itemProperty: any[];
    itemType: any[];
    itemEntry: any[];
    itemTypeAdditionalEntries: any[];
  };
  const baseItemObject: Item = JSON.parse(baseItemsFile);

  const baseItems = baseItemObject.baseitem;
  const typeMap = new Map(
    baseItemObject.itemType.map((type) => [type.abbreviation, type])
  );
  const propertyMap = new Map(
    baseItemObject.itemProperty
      // filter out special property
      // it isn't needed for our system, it only exists in base data to enable filtering
      .filter((p) => p.abbreviation !== "S")
      .map((p) => [p.abbreviation, p])
  );

  // this should be used eventually?
  const _typeAdditionalEntriesMap = new Map(
    baseItemObject.itemTypeAdditionalEntries.map((type) => [
      type.abbreviation,
      type,
    ])
  );

  const expandedItems: Item[] = [];

  baseItems
    .filter((item) => item.srd === true)
    .forEach((item) => {
      let result: Item = structuredClone(item);

      if (typeMap.has(item.type)) {
        result = deepMerge(result, typeMap.get(item.type)) as Item;
      }

      if (item.property !== undefined)
        item.property.forEach((property: string) => {
          if (propertyMap.has(property)) {
            result = deepMerge(result, propertyMap.get(property)) as Item;
          }
        });

      result.id = fmtDataUrl("item", result.name, result.source);
      expandedItems.push(result);
    });

  processedData.push(...expandedItems);
};

await Promise.all([
  processJson(await dataGlob("spells/spells-*.json")),
  processJson("data/conditionsdiseases.json"),
  processJson("data/actions.json"),
  processItems(),
]);

processedData.forEach((data) =>
  Object.entries(data).forEach(([key, value]) => {
    if (typeof value === "object") return;
    if (!filters.has(key)) filters.set(key, new Set());
    filters.get(key)!.add(value);
  })
);

// create map of sets json for filters
await fs.writeFile(
  "processed_data/filters.json",
  JSON.stringify(
    [...filters.entries()]
      .sort()
      .map(([key, value]) => [key, [...value.entries()].map(([e]) => e).sort()])
  )
);

await fs.writeFile(
  "processed_data/data.json",
  JSON.stringify(processedData.sort((a, b) => a.name.localeCompare(b.name)))
);

// copy renderdemo over
await copyJsonMinify("data/renderdemo.json", "processed_data/renderdemo.json");
