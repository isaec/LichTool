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

const keyValueSubstitutions = new Map<string, Map<string, string>>([
  [
    "type",
    new Map([
      ["$", "Treasure"],
      ["A", "Ammunition"],
      ["AF", "Ammunition (futuristic)"],
      ["AIR", "Vehicle (air)"],
      ["AT", "Artisan Tool"],
      ["EM", "Eldritch Machine"],
      ["EXP", "Explosive"],
      ["FD", "Food and Drink"],
      ["G", "Adventuring Gear"],
      ["GS", "Gaming Set"],
      ["GV", "Generic Variant"],
      ["HA", "Heavy Armor"],
      ["INS", "Instrument"],
      ["LA", "Light Armor"],
      ["M", "Melee Weapon"],
      ["MA", "Medium Armor"],
      ["MNT", "Mount"],
      ["MR", "Master Rune "],
      ["OTH", "Other"],
      ["P", "Potion"],
      ["R", "Ranged Weapon"],
      ["RD", "Rod"],
      ["RG", "Ring"],
      ["S", "Shield"],
      ["SC", "Scroll"],
      ["SCF", "Spellcasting Focus"],
      ["SHP", "Vehicle (water)"],
      ["T", "Tool"],
      ["TAH", "Tack and Harness"],
      ["TG", "Trade Good"],
      ["VEH", "Vehicle (land)"],
      ["WD", "Wand"],
    ]),
  ],
  [
    "school",
    new Map([
      ["V", "Evocation"],
      ["D", "Divination"],
      ["I", "Illusion"],
      ["N", "Necromancy"],
      ["C", "Conjuration"],
      ["A", "Abjuration"],
      ["E", "Enchantment"],
      ["T", "Transmutation"],
      ["P", "Psionic"],
    ]),
  ],
]);

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
      case value === undefined:
        // prevent value overwriting
        if (!result.hasOwnProperty(key)) result[key] = value;
        break;
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
// its own type so it can be collapsed
type ItemTypes = {
  type?:
    | "$"
    | "A"
    | "AF"
    | "AIR"
    | "AT"
    | "EM"
    | "EXP"
    | "FD"
    | "G"
    | "GS"
    | "GV"
    | "HA"
    | "INS"
    | "LA"
    | "M"
    | "MA"
    | "MNT"
    | "MR"
    | "OTH"
    | "P"
    | "R"
    | "RD"
    | "RG"
    | "S"
    | "SC"
    | "SCF"
    | "SHP"
    | "T"
    | "TAH"
    | "TG"
    | "VEH"
    | "WD";
};
type Item = DataBaseShape &
  ItemTypes & {
    stealth?: boolean;
    strength?: boolean;
    entries?: any[];
    scfType: "arcane" | "druid" | "holy";
    property?: string[];
    template?: string;
  };

const addEntriesToItem = (item: Item) => {
  const newItem = structuredClone(item);
  const p = (entry: string) => {
    if (!newItem.entries) newItem.entries = [entry];
    else newItem.entries.push(entry);
  };

  // copied from render.js, could fall out of sync
  if (["MA", "LA", "HA"].includes(newItem.type ?? "")) {
    if (newItem.stealth)
      p("The wearer has disadvantage on Dexterity ({@skill Stealth}) checks.");
    if (newItem.type === "HA" && newItem.strength)
      p(
        `If the wearer has a Strength score lower than ${newItem.strength}, their speed is reduced by 10 feet.`
      );
  }
  // evil, but this is the only way to do it - copied verbatim and macro-ed from render.js
  if (newItem.type === "SCF") {
    // @ts-expect-error we need to pass this in once we process item groups, it will always be false for now
    if (newItem._isItemGroup) {
      // isItemGroup
      if (newItem.scfType === "arcane" && newItem.source !== "ERLW") {
        p(
          "An arcane focus is a special item\u2014an orb, a crystal, a rod, a specially constructed staff, a wand-like length of wood, or some similar item\u2014designed to channel the power of arcane spells. A sorcerer, warlock, or wizard can use such an item as a spellcasting focus."
        );
      }
      if (newItem.scfType === "druid") {
        p(
          "A druidic focus might be a sprig of mistletoe or holly, a wand or scepter made of yew or another special wood, a staff drawn whole out of a living tree, or a totem object incorporating feathers, fur, bones, and teeth from sacred animals. A druid can use such an object as a spellcasting focus."
        );
      }
      if (newItem.scfType === "holy") {
        p(
          "A holy symbol is a representation of a god or pantheon. It might be an amulet depicting a symbol representing a deity, the same symbol carefully engraved or inlaid as an emblem on a shield, or a tiny box holding a fragment of a sacred relic. A cleric or paladin can use a holy symbol as a spellcasting focus. To use the symbol in this way, the caster must hold it in hand, wear it visibly, or bear it on a shield."
        );
      }
      // end isItemGroup
    } else {
      if (newItem.scfType === "arcane") {
        p(
          "An arcane focus is a special item designed to channel the power of arcane spells. A sorcerer, warlock, or wizard can use such an item as a spellcasting focus."
        );
      }
      if (newItem.scfType === "druid") {
        p("A druid can use this object as a spellcasting focus.");
      }
      if (newItem.scfType === "holy") {
        p("A holy symbol is a representation of a god or pantheon.");
        p(
          "A cleric or paladin can use a holy symbol as a spellcasting focus. To use the symbol in this way, the caster must hold it in hand, wear it visibly, or bear it on a shield."
        );
      }
    }
  }
  // end of evil
  return newItem;
};

const processItems = async () => {
  const baseItemsFile = await fs.readFile("data/items-base.json", "utf8");

  type ItemId = Item & { id: string };
  const baseItemObject: {
    id: string;
    baseitem: Item[];
    itemProperty: any[];
    itemType: any[];
    itemEntry: any[];
    itemTypeAdditionalEntries: any[];
  } = JSON.parse(baseItemsFile);

  const templateKV = ({
    abbreviation,
    template,
    entries,
  }: {
    abbreviation: string;
    template?: string;
    entries?: any;
    // using the undefined type here is wrong but makes things easier so
  }): [string | undefined, { template?: string; entries?: any }] => {
    const obj: { template?: string; entries?: any } = {};
    if (template !== undefined) obj.template = template;
    if (entries !== undefined) obj.entries = entries;

    return [abbreviation, obj];
  };

  const baseItems = baseItemObject.baseitem;
  const typeMap = new Map(baseItemObject.itemType.map(templateKV));
  const propertyMap = new Map(
    baseItemObject.itemProperty
      // filter out special property
      // it isn't needed for our system, it only exists in base data to enable filtering
      .filter((p) => p.abbreviation !== "S")
      .map(templateKV)
  );

  // this should be used eventually?
  const _typeAdditionalEntriesMap = new Map(
    baseItemObject.itemTypeAdditionalEntries.map(templateKV)
  );

  const expandedItems: ItemId[] = [];

  baseItems
    .filter((item) => item.srd === true)
    .forEach((item) => {
      let result: Item = structuredClone(item);

      if (typeMap.has(item.type)) {
        result = deepMerge(result, typeMap.get(item.type)!) as Item;
      }

      if (item.property !== undefined)
        item.property.forEach((property: string) => {
          if (propertyMap.has(property)) {
            result = deepMerge(result, propertyMap.get(property)!) as Item;
          }
        });

      (result as ItemId).id = fmtDataUrl("item", result.name, result.source);

      result = addEntriesToItem(result);

      expandedItems.push(result as ItemId);
    });

  const expandedAndTemplatedItems = expandedItems.map((item) => {
    if (!item.template) return item;
    const template = item.template.replaceAll(
      /{{item\.(\w+)}}/g,
      (match, key: keyof typeof item) => {
        return item[key]!.toString();
      }
    );
    return { ...item, template };
  });

  processedData.push(...expandedAndTemplatedItems);
};

await Promise.all([
  processJson(await dataGlob("spells/spells-*.json")),
  processJson("data/conditionsdiseases.json"),
  processJson("data/actions.json"),
  processItems(),
]);

// iterate over all data to apply replacements
processedData.forEach((data) => {
  Object.entries(data).forEach(([key, value]) => {
    if (keyValueSubstitutions.has(key) && typeof value === "string") {
      // @ts-expect-error
      data[key] = keyValueSubstitutions.get(key)?.get(value);
    }
  });
});

// iterate over all data to build filters
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
