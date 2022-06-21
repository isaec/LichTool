import { expect, it, describe } from "vitest";
import {
  arrayCombinate,
  combinate,
  generate,
  optional,
  some,
} from "./combinate";

describe("arrayCombinate", () => {
  it("returns all combinations of an array", () => {
    expect(arrayCombinate(["a", "b", "c", "d"])).toEqual([
      [],
      ["a"],
      ["b"],
      ["a", "b"],
      ["c"],
      ["a", "c"],
      ["b", "c"],
      ["a", "b", "c"],
      ["d"],
      ["a", "d"],
      ["b", "d"],
      ["a", "b", "d"],
      ["c", "d"],
      ["a", "c", "d"],
      ["b", "c", "d"],
      ["a", "b", "c", "d"],
    ]);
  });
});

describe("combinate", () => {
  it("returns all combinations of an object", () => {
    expect(combinate(["a", "b"], { a: 1, b: 2, c: 3, d: 4 })).toEqual([
      {
        c: 3,
        d: 4,
      },
      {
        a: 1,
        c: 3,
        d: 4,
      },
      {
        b: 2,
        c: 3,
        d: 4,
      },
      {
        a: 1,
        b: 2,
        c: 3,
        d: 4,
      },
    ]);
  });

  it("behaves properly with nested objects", () => {
    expect(combinate(["a", "c"], { a: 1, b: 2, c: { d: 3, e: 4 } })).toEqual([
      {
        b: 2,
      },
      {
        a: 1,
        b: 2,
      },
      {
        b: 2,
        c: {
          d: 3,
          e: 4,
        },
      },
      {
        a: 1,
        b: 2,
        c: {
          d: 3,
          e: 4,
        },
      },
    ]);
  });
});

describe("generate", () => {
  it("does the thing", () => {
    console.log(
      generate({
        a: some([1, 2, 3]),
        l: optional(5),
        b: 10,
        c: 6,
      })
    );
  });
});
