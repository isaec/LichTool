import { expect, it } from "vitest";
import { arrayCombinate } from "./combinate";

it("returns all combinations of an array", () => {
  expect(arrayCombinate(["a", "b", "c", "d"])).toEqual([
  [],
  [ "a" ],
  [ "b" ],
  [ "a", "b" ],
  [ "c" ],
  [ "a", "c" ],
  [ "b", "c" ],
  [ "a", "b", "c" ],
  [ "d" ],
  [ "a", "d" ],
  [ "b", "d" ],
  [ "a", "b", "d" ],
  [ "c", "d" ],
  [ "a", "c", "d" ],
  [ "b", "c", "d" ],
  [ "a", "b", "c", "d" ]
])
})