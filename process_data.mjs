import glob from "glob-promise";

const result = await glob("spells/spells-*.json", { cwd: "data" });
console.log(result);
