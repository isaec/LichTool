import { Currency } from "@src/generalTypes";
import { convert } from "./currency";

describe("convert", () => {
  it.each([
    [10, "cp", "sp", 1],
    [1, "cp", "cp", 1],
  ] as Array<[number, Currency, Currency, number]>)(
    "converts %s %s to %s",
    (value, from, to, expected) => {
      expect(convert(value, from, to)).toBe(expected);
    }
  );
});
