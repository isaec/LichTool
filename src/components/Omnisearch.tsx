import MiniSearch from "minisearch";
import { DataSpell } from "./Renderer/types";
import { spellArray } from "@src/dataLookup";
import { Component, createMemo, createSignal, For } from "solid-js";
import { searchResultFn } from "./SearchResult";

// use the same minisearch for each search instance
const search = new MiniSearch({
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
search.addAll(spellArray);

const Omnisearch: Component<{}> = (props) => {
  const [query, setQuery] = createSignal("");
  const results = createMemo(() => search.search(query()));
  return (
    <>
      <input
        value={query()}
        onInput={(e) => {
          setQuery(e.currentTarget.value);
        }}
      />
      <For each={results()}>{searchResultFn}</For>
    </>
  );
};
export default Omnisearch;
