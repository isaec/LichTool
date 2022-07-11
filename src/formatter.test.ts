import { describe, expect, it } from "vitest";
import { spellArray } from "./dataLookup";
import { extractTypeFromUrl, fmtDataUrl, fmtRange } from "./formatter";

describe("fmtRange", () => {
  it.each(
    [
      ...new Set(spellArray.map((spell) => JSON.stringify(spell.range))),
    ].flatMap((range) => [
      [range, false, JSON.parse(range)],
      [range, true, JSON.parse(range)],
    ])
  )("%s matches snapshot, shorten: %s", (_display, shorten, range) => {
    expect(fmtRange(range, shorten)).toMatchSnapshot();
  });
});

describe("fmtDataUrl", () => {
  it.each(spellArray.map((spell) => [spell.name, spell.source]))(
    "%s from %s fmt matches snapshot",
    (name, source) => {
      expect(fmtDataUrl("spell", name, source)).toMatchSnapshot();
    }
  );
});

describe("extractTypeFromUrl", () => {
  it.each(spellArray.map((spell) => [spell.id]))(
    "spell id %s has type extracted to spell",
    (url) => {
      expect(extractTypeFromUrl(url)).toEqual("spell");
    }
  );
});
