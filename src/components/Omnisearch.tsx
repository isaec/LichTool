import MiniSearch, { SearchResult } from "minisearch";
import { DataSpell } from "./Renderer/types";
import { spellArray, spellMap, filterKeys } from "@src/dataLookup";
import {
  batch,
  Component,
  createDeferred,
  createEffect,
  createMemo,
  createSignal,
  For,
  Show,
  untrack,
} from "solid-js";
import { createStore } from "solid-js/store";
import { SearchResult as SearchResultElement } from "./SearchResult";

import styles from "./Omnisearch.module.scss";
import { schoolAbbreviationMap } from "./generalTypes";
import { useSearchParams } from "solid-app-router";
import { hammingDistanceFrom } from "@src/hamming";

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

const isOnlyDigits = /^\d+$/;
const parseFilter = (filter: string) => {
  if (isOnlyDigits.test(filter)) return parseInt(filter);
  return filter.toLowerCase();
};

type FilterData = {
  key: string;
  value: string;
};
type PopulatedFilter = FilterData & {
  use: true;
};
type BlankFilter = Partial<FilterData> & {
  use: false;
};
type Filter = BlankFilter | PopulatedFilter;

const isBlank = (filter: Filter): filter is BlankFilter => !filter.use;
const isPopulated = (filter: Filter): filter is PopulatedFilter => filter.use;

const SmartInput: Component<{
  /* undefined union means it must be passed but can be undefined */
  value: string | undefined;
  options: string[] | undefined;
  onInput: (value: string) => void;
}> = (props) => {
  return (
    <div class={styles.smartInput}>
      <input
        value={props.value ?? ""}
        onInput={(e) => props.onInput(e.currentTarget.value)}
      />
      <Show when={props.options !== undefined && props.options.length !== 0}>
        <div class={styles.keyDropdown}>
          <For each={props.options}>{(option) => <p>{option}</p>}</For>
        </div>
      </Show>
    </div>
  );
};

const FilterComponent: Component<{
  filter: Filter | BlankFilter;
  setFilter: (filter: Partial<Filter>) => void;
}> = (props) => {
  const keyOptions = createMemo(() => {
    if (props.filter.key === undefined) return filterKeys;
    return filterKeys
      .filter((key) => key.includes(props.filter.key!))
      .sort(hammingDistanceFrom(props.filter.key));
  });
  // make use true if the filter validates
  createEffect(() => {
    if (props.filter.key === undefined || props.filter.value === undefined) {
      props.setFilter({ use: false });
    } else {
      props.setFilter({ use: true });
    }
  });
  return (
    <>
      <SmartInput
        value={props.filter.key}
        options={keyOptions()}
        onInput={(s) => {
          props.setFilter({ key: s });
        }}
      />
      <SmartInput
        value={props.filter.value}
        options={undefined}
        onInput={(s) => {
          props.setFilter({ value: s });
        }}
      />
    </>
  );
};

const filterValueTransforms = new Map([["school", schoolAbbreviationMap]]);

/**
 * @param dataObj the data object to filter based on
 * @param filterObj the details of the filter to apply
 * @returns true if the data object matches the filter
 */
const testFilter = (dataObj: DataSpell, filterObj: PopulatedFilter) => {
  const filter = parseFilter(filterObj.value);
  const key = filterObj.key;
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
    filters: [] as Filter[],
    get populatedFilters() {
      return this.filters.filter(isPopulated);
    },
  });
  const setQuery = (query: string) => {
    setSearch("query", query);
    setSearchParams({ query });
  };
  const filterFn = (result: SearchResult) => {
    const dataObj = spellMap.get(result.id)!;
    return !search.populatedFilters.some(
      (filter) => !testFilter(dataObj, filter)
    );
  };
  const deferredQuery = createDeferred(() => search.query, { timeoutMs: 200 });
  const results = createMemo(() =>
    searchEngine.search(deferredQuery(), {
      filter: filterFn,
    })
  );
  return (
    <>
      <div class={styles.Omnisearch}>
        <For each={search.filters}>
          {(filter, index) => (
            <FilterComponent
              filter={filter}
              setFilter={(newFilter: Partial<Filter>) => {
                setSearch("filters", index(), newFilter);
              }}
            />
          )}
        </For>
        <input
          class={styles.entryBar}
          value={search.query}
          onInput={(e) => {
            batch(() => {
              if (e.currentTarget.value[0] === ".") {
                setQuery("");
                setSearch("filters", (arr) => arr.concat({ use: false }));
                e.currentTarget.value = "";
              } else {
                setQuery(e.currentTarget.value);
              }
            });
          }}
        />
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
