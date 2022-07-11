import { describe, expect, it } from "vitest";
import { spellArray } from "./dataLookup";
import { fmtRange } from "./formatter";

describe("fmtRange", () => {
  it.each(
    [
      ...new Set(spellArray.map((spell) => JSON.stringify(spell.range))),
    ].flatMap((range) => [
      [range, false, JSON.parse(range)],
      [range, true, JSON.parse(range)],
    ])
  )("%s matches snapshot,  shorten: %s", (_display, shorten, range) => {
    expect(fmtRange(range, shorten)).toMatchSnapshot();
  });
});
