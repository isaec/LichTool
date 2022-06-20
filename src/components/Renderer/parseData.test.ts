import { describe, expect, it, vi } from "vitest";

import parseData from "./parseData"

describe("parseData", () => {
  it.each([
    { key: 10, anotherKey: "string" },
    { nest: { very: { deeply: { bool: true } } } },
  ])("parses string json into object json", (obj) => {
    expect(parseData(JSON.stringify(obj))).toStrictEqual(obj);
  });

  it.each(["this is a string!"])("parses naked strings into strings", (str) => {
    expect(parseData(str)).toStrictEqual(str);
  });

  it.each(["this is a string!"])(
    "parses quoted strings into strings",
    (str) => {
      expect(parseData(`"${str}"`)).toBe(str);
    }
  );

  it.each([
    {
      type: "~",
    },
    {
      type: "some other type",
    },
  ])("returns safe objects", (obj) => {
    expect(parseData(obj)).toStrictEqual(obj);
  });

  it.each([
    {
      type: null,
    },
    {
      type: 10,
    },
    {
      notTyped: "lol",
    },
  ])("throws error on a clearly unsafe object", (obj) => {
    expect(() => parseData(obj)).toThrow();
  });
});