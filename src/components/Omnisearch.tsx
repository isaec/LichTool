import MiniSearch, { SearchResult } from "minisearch";
import { DataSpell } from "./Renderer/types";
import { spellArray, spellMap } from "@src/dataLookup";
import {
  Component,
  createDeferred,
  createMemo,
  createSignal,
  For,
  untrack,
} from "solid-js";
import { createStore } from "solid-js/store";
import { SearchResult as SearchResultElement } from "./SearchResult";

import styles from "./Omnisearch.module.scss";
import { schoolAbbreviationMap } from "./generalTypes";
import { useSearchParams } from "solid-app-router";

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

const isOnlyDigits = /^[0-9]+$/;
const parseFilter = (filter: string) => {
  if (isOnlyDigits.test(filter)) return parseInt(filter);
  return filter.toLowerCase();
};

const Filter: Component<{
  store: {
    search: {
      filters: { [key: string]: string };
    };
    setSearch: (arg0: string, arg1: string, arg2: string | undefined) => void;
  };
  filterKey: string;
}> = (props) => (
  <>
    <label>{`${props.filterKey}: `}</label>
    <input
      value={props.store.search.filters[props.filterKey] ?? ""}
      onInput={(e) => {
        props.store.setSearch(
          "filters",
          props.filterKey,
          e.currentTarget.value === "" ? undefined : e.currentTarget.value
        );
      }}
    />
  </>
);

const filterValueTransforms = new Map([["school", schoolAbbreviationMap]]);

const testFilter = (
  dataObj: DataSpell,
  key: string,
  filter: string | number
) => {
  const val = dataObj[key as keyof DataSpell];
  if (typeof filter === "number") return val === filter;
  if (typeof filter === "string" && typeof val === "string") {
    const transformedValue = filterValueTransforms.get(key)?.get(val as any);
    if (transformedValue !== undefined) {
      return (
        transformedValue.toLowerCase().includes(filter) ||
        val.toLowerCase().includes(filter)
      );
    }
    return val.toLowerCase().includes(filter);
  }
  return false;
};

const Omnisearch: Component<{}> = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = createStore({
    query: searchParams.query ?? "",
    filters: {} as { [key: string]: string },
  });
  const filterFn = (result: SearchResult) => {
    const dataObj = spellMap.get(result.id);
    return !Object.entries(search.filters).some(
      ([key, filter]) => !testFilter(dataObj!, key, parseFilter(filter))
    );
  };
  const deferredQuery = createDeferred(() => search.query, { timeoutMs: 200 });
  const results = createMemo(() =>
    searchEngine.search(deferredQuery(), {
      filter: filterFn,
    })
  );
  const searchStore = { search, setSearch };
  return (
    <>
      <div class={styles.Omnisearch}>
        <input
          class={styles.entryBar}
          value={search.query}
          onInput={(e) => {
            setSearch("query", e.currentTarget.value);
            setSearchParams({ query: e.currentTarget.value });
          }}
        />
        <Filter store={searchStore} filterKey={"level"} />
        <Filter store={searchStore} filterKey={"school"} />
      </div>
      <div class={styles.results}>
        <For each={results()}>
          {(result) => <SearchResultElement id={result.id} />}
        </For>
      </div>
    </>
  );
};
export default Omnisearch;
