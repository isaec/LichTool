import MiniSearch from "minisearch";
import { DataSpell } from "./Renderer/types";
import { spellArray } from "@src/dataLookup";
import { Component, createMemo, For } from "solid-js";
import { createStore } from "solid-js/store";
import { searchResultFn } from "./SearchResult";

// use the same minisearch for each search instance
const searchEngine = new MiniSearch({
  fields: ["name", "entries"],
  // highly naive field extraction
  extractField: (spell, field) => {
    const val: DataSpell[keyof DataSpell] = spell[field];
    if (typeof val === "string") return val;
    if (typeof val === "number") return val.toString();
    const results: string[] = [];
    type Node = { entries?: Node } | Node[] | string | number;
    const recurse = (data: Node) => {
      if (typeof data === "string") results.push(data);
      else if (typeof data === "number") results.push(data.toString());
      else if (Array.isArray(data)) data.forEach((d) => recurse(d));
      else if (typeof data === "object" && data.entries !== undefined)
        recurse(data.entries);
    };
    recurse(val as Node);
    return results.join("");
  },
  searchOptions: {
    fuzzy: 0.2,
    prefix: true,
    weights: {
      fuzzy: 1,
      prefix: 2,
    },
    boost: {
      name: 10,
    },
  },
});
searchEngine.addAll(spellArray);

const Omnisearch: Component<{}> = () => {
  const [search, setSearch] = createStore({
    query: "",
  });
  const results = createMemo(() => searchEngine.search(search.query));
  return (
    <>
      <input
        value={search.query}
        onInput={(e) => {
          setSearch("query", e.currentTarget.value);
        }}
      />
      <For each={results()}>{searchResultFn}</For>
    </>
  );
};
export default Omnisearch;
