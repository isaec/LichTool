import { Currency } from "@src/generalTypes";
import { convert, convertFloor } from "./currency";

describe("convert", () => {
  it.each([
    [10, "cp", "sp", 1],
    [1, "cp", "cp", 1],
    [1, "cp", "sp", 0.1],
    [1, "cp", "ep", 0.02],
    [100, "cp", "gp", 1],
    [100_000, "cp", "pp", 100],
    [1e6, "pp", "cp", 1e9],
  ] as Array<[number, Currency, Currency, number]>)(
    "converts %s %s to %s",
    (value, from, to, expected) => {
      expect(convert(value, from, to)).toBe(expected);
    }
  );
});

describe("convertFloor", () => {
  it.each([
    [10, "cp", "sp", 1],
    [1, "cp", "cp", 1],
    [1, "cp", "sp", 0],
    [1, "cp", "ep", 0],
    [100, "cp", "gp", 1],
    [100_000, "cp", "pp", 100],
    [1e6, "pp", "cp", 1e9],
  ] as Array<[number, Currency, Currency, number]>)(
    "converts %s %s to %s",
    (value, from, to, expected) => {
      expect(convertFloor(value, from, to)).toBe(expected);
    }
  );
});
