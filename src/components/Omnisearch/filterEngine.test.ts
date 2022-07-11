import { describe, expect, it } from "vitest";
import { parseFilter } from "./filterEngine";

describe("filterEngine", () => {
  it.todo("matches snapshot for search results given filter");
});

describe("parseFilter", () => {
  describe.each([
    [
      "number",
      [
        ["1", 1],
        ["55", 55],
      ],
    ],
    [
      "boolean",
      [
        ["true", true],
        ["false", false],
      ],
    ],
  ] as Array<[string, Array<[string, ReturnType<typeof parseFilter>]>]>)(
    "parses %s into the correct literal",
    (type, cases) => {
      it.each(cases)(
        `parses %s into ${type} literal of "%s"`,
        (string, literal) => {
          expect(parseFilter(string)).toBe(literal);
        }
      );
    }
  );
});
