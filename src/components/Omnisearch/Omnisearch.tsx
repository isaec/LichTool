import { dataMap } from "@src/dataLookup";
import {
  batch,
  Component,
  createComputed,
  createMemo,
  For,
  untrack,
} from "solid-js";
import { createStore } from "solid-js/store";
import { Results } from "./SearchResult";

import styles from "./Omnisearch.module.scss";
import { useSearchParams } from "solid-app-router";
import { createDebouncedMemo } from "@solid-primitives/memo";
import searchEngine from "./dataMiniSearch";
import FilterComponent from "./FilterComponent";
import {
  isParamFilter,
  Filter,
  isPopulated,
  executeFilters,
} from "./filterEngine";
import { groupResults } from "./groupResults";

const Omnisearch: Component<{}> = () => {
  let ref: HTMLInputElement | undefined;
  const focusOmnisearch = () => {
    ref?.focus();
  };
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = createStore({
    query: searchParams.query ?? "",
    filters: Object.entries(searchParams)
      .filter(([key]) => isParamFilter.test(key))
      .map(
        ([param, value]): Filter => ({
          key: param.substring(2),
          value,
          use: true,
        })
      ),
    get populatedFilters() {
      return this.filters.filter(isPopulated);
    },
  });
  const populatedFilters = createMemo(() => search.populatedFilters);

  // keep search params up to date with store filters, query
  createComputed(() => {
    batch(() => {
      const newParams = populatedFilters().reduce(
        (acc, filter) => {
          acc[`f_${filter.key}`] = filter.value;
          return acc;
        },
        { query: search.query } as Record<string, string | null>
      );
      const currentKeys = untrack(() => Object.keys(searchParams));
      const replace = Object.keys(newParams).every((key) =>
        currentKeys.includes(key)
      );
      setSearchParams(newParams, { replace });
    });
  });
  const debouncedQuery = createDebouncedMemo(() => search.query, 50);
  const debouncedPopulatedFilters = createDebouncedMemo(
    // this hack subscribes the function to the reading of every property of the filters
    () => populatedFilters().map((f) => ({ ...f })),
    150
  );

  const results = createMemo(() => {
    // show everything if there are no params
    if (
      debouncedQuery().length === 0 &&
      debouncedPopulatedFilters().length === 0
    ) {
      return groupResults([...dataMap.values()]);
    }
    if (debouncedQuery().length === 0) {
      // filter without any search
      return groupResults(
        [...dataMap.values()].filter(
          executeFilters(debouncedPopulatedFilters())!
        )
      );
    }
    return groupResults(
      searchEngine.search(debouncedQuery(), {
        filter: executeFilters(debouncedPopulatedFilters()),
      })
    );
  });
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
              removeSelf={() => {
                const arr = [...search.filters];
                arr.splice(index(), 1);
                setSearch("filters", arr);
                if (arr.length === 0) focusOmnisearch();
              }}
              focusOmnisearch={focusOmnisearch}
            />
          )}
        </For>
        <input
          ref={ref}
          class={styles.entryBar}
          value={search.query}
          type="search"
          onInput={(e) => {
            if (e.currentTarget.value[0] === ".") {
              batch(() => {
                setSearch("query", e.currentTarget.value.slice(1));
                setSearch("filters", (arr) => arr.concat({ use: false }));
              });
              e.currentTarget.value = search.query;
            } else {
              setSearch("query", e.currentTarget.value);
            }
          }}
        />
      </div>
      <Results results={results()} />
    </>
  );
};
export default Omnisearch;
