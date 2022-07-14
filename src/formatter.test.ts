import { describe, expect, it } from "vitest";
import { dataArray, isDataSpell } from "./dataLookup";
import {
  extractTypeFromUrl,
  fmtDataUrl,
  fmtNameForUrl,
  fmtRange,
} from "./formatter";

const dedupe = <T>(arr: T[]): Array<[string, T]> =>
  [...new Set(arr.map((v) => JSON.stringify(v)))].map((v) => [
    v,
    JSON.parse(v),
  ]);

describe("fmtRange", () => {
  it.each(
    dedupe(dataArray.filter(isDataSpell).map((spell) => spell.range)).flatMap(
      ([str, range]): Array<[typeof str, boolean, typeof range]> => [
        [str, false, range],
        [str, true, range],
      ]
    )
  )("%s matches snapshot, shorten: %s", (_display, shorten, range) => {
    expect(fmtRange(range, shorten)).toMatchSnapshot();
  });
});

describe("fmtDataUrl", () => {
  it.each(
    dataArray.map((data) => [
      data.name,
      data.source,
      extractTypeFromUrl(data.id),
    ])
  )("%s from %s fmt matches snapshot", (name, source, type) => {
    expect(fmtDataUrl(type, name, source)).toMatchSnapshot();
  });
  it.each(dataArray.map((data) => data.name))(
    "%s is name parsed with same capitalization",
    (name) => {
      const hyphenated = name.replaceAll(/\s/g, "-");

      expect(
        fmtNameForUrl(name.toLowerCase()),
        `${name}, hyphenated as "${hyphenated}" should match the formatted variant as lowercase`
      ).toBe(hyphenated);

      expect(
        fmtNameForUrl(name.toUpperCase()),
        `${name}, hyphenated as "${hyphenated}" should match the formatted variant as uppercase`
      ).toBe(hyphenated);
    }
  );
});

describe("extractTypeFromUrl", () => {
  it.each(dataArray.filter(isDataSpell).map((spell) => [spell.id]))(
    "spell id %s has type extracted to spell",
    (url) => {
      expect(extractTypeFromUrl(url)).toEqual("spell");
    }
  );
});

// describe("fmtDuration", () => {
//   it.each([
//     ...new Set(
//       dataArray
//         .filter(isDataSpell)
//         .map((spell) => JSON.stringify(spell.duration))
//     ),
//   ])();
// });
