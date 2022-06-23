import { expect, it, describe } from "vitest";
import { generate, one, optional, some } from "./combinate";

generate<{
  opt?: number;
  required: number;
  alsoOptional?: number[] | string;
  numberArray?: Array<1 | 2 | 3> | "test";
}>({
  opt: optional(1),
  required: 5,
  alsoRequired: optional("10"),
  numberArray: some([1, 2, 3]),
});

it.each([
  {
    a: some([1, 2]),
    c: 6,
  },
  {
    a: some([1, 2]),
    l: optional(5),
    b: 10,
    c: 6,
  },
  {
    one: one([1, 2]),
    optional: optional(5),
  },
])(`matches snapshots for %s`, (generateObject) => {
  // console.log(generateObject);
  expect(generate(generateObject as any)).toMatchSnapshot();
});
