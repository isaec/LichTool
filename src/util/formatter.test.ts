import { describe, expect, it } from "vitest";
import { dataArray, DataItem, isDataItem, isDataSpell } from "@src/dataLookup";
import {
  extractTypeFromUrl,
  fmtAndList,
  fmtCurrency,
  fmtDataUrl,
  fmtDuration,
  fmtItemType,
  fmtNameForUrl,
  fmtNumber,
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

describe("fmtNumber", () => {
  it.each([
    [0, "0"],
    [1, "1"],
    [10, "10"],
    [100, "100"],
    [1000, "1,000"],
    [10000, "10,000"],
    [100000, "100,000"],
    [1000000, "1,000,000"],
    [1234567, "1,234,567"],
    // decimal tests
    [0.1, "0.1"],
    [0.01, "0.01"],
    [0.001, "0.001"],
    [0.0001, "0.0001"],
    [0.00001, "0.00001"],
    // mixed tests
    [1000.123, "1,000.123"],
    [1234567.1234567, "1,234,567.1234567"],
    // max decimal testing
    [1.234567890123456789, "1.23", 2],
    [1.1, "1", 0],
    [1.5, "2", 0],
    [1.4, "1", 0],
  ])("%s is formatted to %s", (num, str, maxDecimal = 20) => {
    expect(fmtNumber(num, maxDecimal)).toBe(str);
  });
});

describe("fmtItemType", () => {
  it.each(
    dataArray
      .filter(isDataItem)
      .map((item): [string, DataItem] => [item.name, item])
  )("%s matches snapshot", (_display, item) => {
    expect(fmtItemType(item)).toMatchSnapshot();
  });
});

describe("fmtCurrency", () => {
  it.each([
    [0, "0 cp", "0 copper"],
    [1, "1 cp", "1 copper"],
    [2, "2 cp", "2 copper"],
    [200, "2 gp", "2 gold"],
    [2000, "2 pp", "2 platinum"],
    [2400, "2 pp, 4 gp", "2 platinum and 4 gold"],
    [1_000_000, "1,000 pp", "1,000 platinum"],
    [
      12345,
      "12 pp, 3 gp, 4 sp, 5 cp",
      "12 platinum, 3 gold, 4 silver, and 5 copper",
    ],
  ])(
    "formats %s to %s, and full %s using all currency",
    (value, expected, expectedFull) => {
      expect(fmtCurrency(value, false, false)).toBe(expected);
      expect(fmtCurrency(value, true, false)).toBe(expectedFull);
    }
  );
  it.each([
    [0, "0 cp", "0 copper"],
    [1, "1 cp", "1 copper"],
    [2, "2 cp", "2 copper"],
    [200, "2 gp", "2 gold"],
    [2000, "20 gp", "20 gold"],
    [2400, "24 gp", "24 gold"],
    [1_000_000, "10,000 gp", "10,000 gold"],
    [12345, "123 gp, 4 sp, 5 cp", "123 gold, 4 silver, and 5 copper"],
  ])(
    "formats %s to %s, and full %s without using rare currency",
    (value, expected, expectedFull) => {
      expect(fmtCurrency(value)).toBe(expected);
      expect(fmtCurrency(value, true)).toBe(expectedFull);
    }
  );
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
