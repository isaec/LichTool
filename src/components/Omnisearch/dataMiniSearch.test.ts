import { describe, it, expect } from "vitest";
import dataMiniSearch from "./dataMiniSearch";

describe("dataMiniSearch", () => {
  it.each(["fireball", "fire blt", "antipathy sympathy", "mine black", "find"])(
    "matches snapshot for search results with query %s",
    (query) => {
      expect(dataMiniSearch.search(query)).toMatchSnapshot();
    }
  );
});
