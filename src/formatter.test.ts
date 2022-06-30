import { describe, expect, it } from "vitest";
import { spellArray } from "./dataLookup";
import { fmtRange } from "./formatter";

describe("fmtRange", () => {
  it.each(
    [...new Set(spellArray.map((spell) => JSON.stringify(spell.range)))].map(
      (range) => [range, JSON.parse(range)]
    )
  )("%s matches snapshot", (_display, range) => {
    expect(fmtRange(range)).toMatchSnapshot();
  });
});
