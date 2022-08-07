import { dataMap } from "@src/dataLookup";
import {
  batch,
  Component,
  createComputed,
  createEffect,
  createMemo,
  createSelector,
  createSignal,
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
  isBlank,
  executeFilters,
} from "./filterEngine";
import { groupResults } from "./groupResults";

const Omnisearch: Component<{}> = () => {
  let ref: HTMLInputElement | undefined;
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
    get blankFilters() {
      return this.filters.filter(isBlank);
    },
  });
  const populatedFilters = createMemo(() => search.populatedFilters);
  const blankFilters = createMemo(() => search.blankFilters);

  // which portion of the search ui should be focused
  // filters.length focus is the fuzzy search
  // 0 is the top of the filters
  // focus is only changed when the signal is updated, focus is not forced
  const [focus, setFocus] = createSignal(search.filters.length, {
    // when a new filter element is added it is in the same focus position
    // but that focus position refers to a different element, so setting (f) => f is not equal
    equals: false,
  });
  const isFocus = createSelector(focus);
  createEffect(() => {
    console.log("focus:", focus());
    if (focus() < 0 || focus() > search.filters.length) {
      console.error(
        `Focus out of bounds: ${focus()}`,
        `Legal range is 0..${search.filters.length}`
      );
    }
    if (isFocus(search.filters.length)) {
      // focus the omnisearch input
      ref?.focus();
    }
    // other elements handle focusing themselves
  });

  // keep search params up to date with store filters, query
  createComputed(() => {
    batch(() => {
      const newParams = populatedFilters().reduce(
        (acc, filter) => {
          acc[`f_${filter.key}`] = filter.value;
          return acc;
        },

        blankFilters().reduce(
          (acc, filter) => {
            acc[`f_${filter.key}`] = "";
            return acc;
          },
          {
            query: search.query,
          } as Record<string, string>
        )
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
    300
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
                // remove this index from the filters array
                const arr = [...search.filters];
                arr.splice(index(), 1);
                setSearch("filters", arr);
                // focus the next filter up the page, or the omnisearch
                setFocus((f) => Math.max(0, f - 1));
              }}
              isFocused={isFocus(index())}
              onGainedFocus={() => setFocus(index())}
              onFinish={() => {
                // focus the next filter down the page, or the omnisearch
                // this should be safe to call without clamping?
                setFocus((f) => f + 1);
              }}
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
                // this line is highly strange and requires understanding solid-js internals
                // the above call is batched, and thus not in effect yet
                // because all these calls will go into effect at the same time, this is focusing the new element
                setFocus(search.filters.length);
              });
              e.currentTarget.value = search.query;
            } else {
              setSearch("query", e.currentTarget.value);
            }
          }}
          onFocus={() => {
            // IMPORTANT: this check is needed, because focus values are not diffed
            // without this check, lots of deeply nested reactive code will trigger unnecessarily
            if (!isFocus(search.filters.length)) {
              setFocus(search.filters.length);
            }
          }}
          // onkeydown to detect backspace
          onKeyDown={(e) => {
            if (
              e.key === "Backspace" &&
              e.currentTarget.selectionStart === 0 &&
              e.currentTarget.selectionEnd === 0
            ) {
              e.preventDefault();
              // switch focus to the previous filter
              setFocus((f) => Math.max(0, f - 1));
            }
          }}
        />
      </div>
      <Results results={results()} />
    </>
  );
};
export default Omnisearch;
