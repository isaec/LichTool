import { describe, expect, it } from "vitest";
import { dataArray, isDataSpell } from "@src/dataLookup";
import {
  extractTypeFromUrl,
  fmtAndList,
  fmtCurrency,
  fmtDataUrl,
  fmtDuration,
  fmtNameForUrl,
  fmtOrList,
  fmtRange,
} from "./formatter";

const dedupe = <T>(arr: T[]): Array<[string, T]> =>
  [...new Set(arr.map((v) => JSON.stringify(v)))].map((v) => [
    v,
    JSON.parse(v),
  ]);

const lists = [
  ["one"] as const,
  ["one", "two"] as const,
  ["one", "two", "three"] as const,
  ["one", "two", "three", "four"] as const,
  ["one", "two", "three", "four", "five"] as const,
  ["one", "two", "three", "four", "five", "six"] as const,
] as const;

describe("fmtAndList", () => {
  lists.forEach((list) => {
    it(`should format ${list}`, () => {
      expect(fmtAndList(list)).toMatchSnapshot();
    });
    it(`should format ${list} without serial comma`, () => {
      expect(fmtAndList(list, false)).toMatchSnapshot();
    });
  });
});

describe("fmtOrList", () => {
  lists.forEach((list) => {
    it(`should format ${list}`, () => {
      expect(fmtOrList(list)).toMatchSnapshot();
    });
    it(`should format ${list} without serial comma`, () => {
      expect(fmtOrList(list, false)).toMatchSnapshot();
    });
  });
});

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

describe("fmtCurrency", () => {
  it.each([
    [0, "0 cp"],
    [1, "1 cp"],
    [2, "2 cp"],
    [200, "2 gp"],
    [2000, "2 pp"],
  ])("formats %s to %s", (value, expected) => {
    expect(fmtCurrency(value)).toBe(expected);
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

describe("fmtDuration", () => {
  it.each(dedupe(dataArray.filter(isDataSpell).map((spell) => spell.duration)))(
    `%s matches snapshot`,
    (_display, duration) => {
      expect(fmtDuration(duration[0])).toMatchSnapshot();
    }
  );
});
