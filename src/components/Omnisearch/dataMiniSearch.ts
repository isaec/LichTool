import { spellArray } from "@src/dataLookup";
import MiniSearch from "minisearch";

// use the same minisearch for each search instance
const searchEngine = new MiniSearch({
  fields: ["name"],
  searchOptions: {
    fuzzy: 0.5,
    prefix: true,
    weights: {
      fuzzy: 0.65,
      prefix: 1,
    },
  },
});
searchEngine.addAll(spellArray);

export default searchEngine;
