import { dataArray } from "@src/dataLookup";
import { describe, it, expect } from "vitest";
import { groupResults } from "./groupResults";

describe("groupResults", () => {
  it("groups small array to match snapshot", () => {
    const rS1 = { id: "spell_PHB-Acid-Splash" };
    const rS2 = { id: "spell_XGE-Fake-Spell" };
    const rC1 = { id: "condition_PHB-Blindness" };

    const results = [rS1, rS1, rS2, rC1, rS1];
    expect(groupResults(results)).toMatchInlineSnapshot(`
      [
        {
          "results": [
            {
              "id": "spell_PHB-Acid-Splash",
            },
            {
              "id": "spell_PHB-Acid-Splash",
            },
            {
              "id": "spell_XGE-Fake-Spell",
            },
          ],
          "type": "spell",
        },
        {
          "results": [
            {
              "id": "condition_PHB-Blindness",
            },
          ],
          "type": "condition",
        },
        {
          "results": [
            {
              "id": "spell_PHB-Acid-Splash",
            },
          ],
          "type": "spell",
        },
      ]
    `);
  });
});
