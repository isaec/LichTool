import { Component, createMemo, createSignal, For } from "solid-js";
import MiniSearch from "minisearch";
import spells from "@data/spells.json";

// use the same minisearch for each search instance
const search = new MiniSearch({
  idField: "name",
  fields: ["name", "level", "source", "school"],
  storeFields: ["name"],
  searchOptions: {
    fuzzy: 0.2,
    prefix: true,
    weights: {
      fuzzy: 1,
      prefix: 2,
    },
    boost: {
      name: 5,
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
      <For each={results()}>{(result) => <p>{result.id}</p>}</For>
    </div>
  );
};

export default Search;
