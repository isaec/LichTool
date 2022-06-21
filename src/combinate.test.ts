import { expect, it } from "vitest";
import { arrayCombinate, combinate } from "./combinate";

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

it("returns all combinations of an object", () => {
  expect(
    combinate(["a", "b"], { a: 1, b: 2, c: 3, d: 4 })
  ).toMatchInlineSnapshot(`
    [
      {
        "c": 3,
        "d": 4,
      },
      {
        "a": 1,
        "c": 3,
        "d": 4,
      },
      {
        "b": 2,
        "c": 3,
        "d": 4,
      },
      {
        "a": 1,
        "b": 2,
        "c": 3,
        "d": 4,
      },
    ]
  `);
});
