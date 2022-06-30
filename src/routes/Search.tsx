import { Component, createMemo, createSignal, For } from "solid-js";
import MiniSearch from "minisearch";
import spells from "@data/spells.json";
type Spell = typeof spells.spell[number];

// use the same minisearch for each search instance
const search = new MiniSearch({
  idField: "name",
  fields: ["name", "level", "source", "school", "entries"],
  // highly naive field extraction
  extractField: (spell, field) => {
    const val: Spell[keyof Spell] = spell[field];
    if (typeof val === "string") return val;
    if (typeof val === "number") return val.toString();
    const results: string[] = [];
    type Node = { entries?: Node } | Node[] | string | number;
    const recurse = (data: Node) => {
      if (typeof data === "string") results.push(data);
      else if (typeof data === "number") results.push(data.toString());
      else if (Array.isArray(data)) data.forEach((d) => recurse(d as any));
      else if (typeof data === "object" && data.entries !== undefined)
        recurse(data.entries);
    };
    recurse(val as any);
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
      name: 5,
      entries: 0.5,
    },
  },
});
search.addAll(spells.spell);

const Search: Component<{}> = () => {
  const [query, setQuery] = createSignal("");
  const results = createMemo(() => search.search(query()));
  return (
    <div>
      <input
        value={query()}
        onInput={(e) => {
          setQuery(e.currentTarget.value);
        }}
      />
      <For each={results()}>
        {(result) => (
          <p>
            {result.id} {JSON.stringify(result.match)}
          </p>
        )}
      </For>
    </div>
  );
};

export default Search;
