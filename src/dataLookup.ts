// embedding raw is a performance optimization
// https://v8.dev/blog/cost-of-javascript-2019#json
import spells from "@data/spells.json?raw";
import { DataSpell } from "./components/Renderer/types";

/** the array of all spells - id is always undefined */
export const spellArray = JSON.parse(spells).spell as Readonly<
  Array<
    DataSpell & {
      id: string;
    }
  >
>;

/**
map from spellId to spell.
while id does exist on the values, it is not in the type because it should not be further used
*/
export const spellMap = new Map(
  // id is known not to be undefined bc it was inserted when data was processed
  spellArray.map((spell) => [spell.id, spell])
) as ReadonlyMap<string, DataSpell>;
