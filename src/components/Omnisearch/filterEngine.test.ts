import { dataArray } from "@src/dataLookup";
import { describe, expect, it } from "vitest";
import dataMiniSearch from "./dataMiniSearch";
import {
  executeFilters,
  Filter,
  filterIsValid,
  parseFilter,
  PopulatedFilter,
} from "./filterEngine";

describe("filterEngine", () => {
  const tr = (arr: {}[]) => arr.map((o) => ({ ...o, use: true }));
  const cases = [
    {
      query: "fireball",
      filters: tr([{ key: "name", value: "fireball" }]),
    },
    {
      filters: tr([
        {
          key: "name",
          value: `/mind\\b/i`,
        },
      ]),
    },
    {
      query: "m",
      filters: tr([
        {
          key: "level",
          value: "3",
        },
        {
          key: "name",
          value: "i",
        },
      ]),
    },
  ] as {
    query: string;
    filters: Array<PopulatedFilter>;
  }[];

  it.each(
    cases.map((c): [string, string, PopulatedFilter[]] => [
      c.query,
      JSON.stringify(c.filters),
      c.filters,
    ])
  )(
    "matches snapshot for search results given query %s, filter %s",
    (query, _filters, filters) => {
      if (query === undefined) {
        expect(dataArray.filter(executeFilters(filters)!)).toMatchSnapshot();
      } else {
        expect(
          dataMiniSearch
            .search(query, {
              filter: executeFilters(filters),
            })
            .map((q) => ({
              id: q.id,
              terms: q.terms,
            }))
        ).toMatchSnapshot();
      }
    }
  );
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
    [
      "string",
      [
        ["fireball", "fireball"],
        ["fire blt", "fire blt"],
        ["123!", "123!"],
        ["5.5", "5.5"],
        ["/f", "/f"],
        [
          "/this looks like regex/ but its not!",
          "/this looks like regex/ but its not!",
        ],
      ],
    ],
    [
      "RegExp",
      [
        ["/f/", /f/],
        ["/^f/", /^f/],
        ["/something/i", /something/i],
      ],
    ],
  ] as Array<[string, Array<[string, ReturnType<typeof parseFilter>]>]>)(
    "parses %s into the correct literal",
    (type, cases) => {
      it.each(cases)(
        `parses %s into ${type} literal of "%s"`,
        (string, literal) => {
          expect(parseFilter(string)).toStrictEqual(literal);
        }
      );
    }
  );
});

const makeFilter = (key?: string, value?: string, use?: boolean): Filter => {
  // @ts-expect-error if use is true, then values will be populated
  const obj: Filter = {
    use: use ?? (key !== undefined && value !== undefined),
  };
  if (key !== undefined) obj.key = key;
  if (value !== undefined) obj.value = value;
  return obj;
};

describe("filterIsValid", () => {
  it.each([
    // undefined
    [makeFilter(), false, "empty object"],
    [makeFilter(undefined, "waa"), false, "undefined key"],
    [makeFilter("name"), false, "undefined value"],

    // empty
    [makeFilter("name", ""), false, "empty string"],
    [makeFilter("", "waa"), false, "empty string"],

    [makeFilter("name", "fireball"), true],
    [makeFilter("name", "fireball", false), true, "use doesn't matter"],

    [makeFilter("id", "spell"), true],
    [makeFilter("id", "spell_PHB"), true],
    [makeFilter("id", "spell_PHB-Aid"), true],
    [makeFilter("id", "/spell_PHB-Aid/"), true, "any regex is valid"],
    [makeFilter("id", "/spell_PHB-Aid/wee"), false, "unknown flags"],

    [makeFilter("eee", "wahoo"), false, "invalid key"],
  ])("for filter %s returns %s", (filter, expected, reason?: string) => {
    expect(
      filterIsValid(filter),
      reason !== undefined ? `because ${reason}` : undefined
    ).toBe(expected);
  });
});
