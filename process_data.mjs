import glob from "glob-promise";
import path from "path";
import { promises as fs } from "fs";

/**
 * copies a src file to a dest file, using JSON.parse and JSON.stringify to minify it
 */
const copyJsonMinify = async (src, dest) => {
  const srcData = await fs.readFile(src, "utf8");
  const destData = JSON.stringify(JSON.parse(srcData));
  await fs.writeFile(dest, destData);
};

/** make globs nicer to write for data dir */
const dataGlob = async (globStr) =>
  (await glob(globStr, { cwd: "data" })).map((partialPath) =>
    path.join("data", partialPath)
  );

// ensure out dir exists
try {
  await fs.mkdir("processed_data");
} catch (e) {}

// copy spells over
const spells = await dataGlob("spells/spells-*.json");
const processedSpells = [];
await Promise.all(
  spells.map(async (spellPath) => {
    const spellFileData = JSON.parse(
      await fs.readFile(spellPath, "utf8")
    ).spell;
    spellFileData.forEach((spell) => {
      if (spell.srd === true) processedSpells.push(spell);
    });
  })
);
await fs.writeFile(
  "processed_data/spells.json",
  JSON.stringify({ spell: processedSpells })
);

// copy renderdemo over
await copyJsonMinify("data/renderdemo.json", "processed_data/renderdemo.json");
