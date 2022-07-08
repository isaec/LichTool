import { expect, it, describe } from "vitest";
import { hammingDistance, hammingDistanceFrom } from "./hamming";

describe("hammingDistance", () => {
  const cases: Array<[[string, string], number]> = [
    [["string", "string"], 0],
    [["a", "b"], 1],
    [["a", "a"], 0],
    [["a", "aa"], 1],
    [["a", "ab"], 1],
    // test cases with large difference
    [["a", "aaaa"], 3],
    [["a", "bbbb"], 4],
    [["this is a full on sentence!", "this is a full on"], 10],
  ];

  it.each(cases)(
    "returns the correct hamming distance between %s of %s",
    ([a, b], distance) => {
      expect(hammingDistance(a, b)).toEqual(distance);
    }
  );
});

const strings = [
  "",
  "word word word",
  "word word",
  "word wasp",
  "wild world",
  "without a care",
  "related string",
  "bonus string!",
] as const;

describe("hammingDistanceFrom", () => {
  it("sorts cases correctly", () => {
    expect([...strings].sort(hammingDistanceFrom("word wash")))
      .toMatchInlineSnapshot(`
        [
          "word wasp",
          "word word",
          "wild world",
          "word word word",
          "",
          "bonus string!",
          "without a care",
          "related string",
        ]
      `);
  });
});
