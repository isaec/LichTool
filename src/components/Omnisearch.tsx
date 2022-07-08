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
    fuzzy: 0.5,
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
  focus: boolean;
  valid: boolean;
  disabled?: boolean;
  finishKey: "Enter" | "Space";
  onFinish: () => void;
  onEscape: () => void;
  onInput: (value: string) => void;
}> = (props) => {
  const [focused, setFocused] = createSignal(false);
  const [hasMouseDown, setHasMouseDown] = createSignal(false);
  let ref: HTMLInputElement | undefined;
  createEffect(() => {
    if (props.focus) ref?.focus();
  });
  const tryFinish = () => {
    if (
      !props.valid &&
      (props.options === undefined || props.options.length === 0)
    )
      return;
    if (!props.valid) {
      props.onInput(props.options![0]);
    }
    props.onFinish();
  };
  return (
    <div class={styles.smartInput}>
      <input
        ref={ref}
        classList={{
          [styles.error]:
            !props.disabled &&
            !props.valid &&
            (props.options?.length === 0 || props.options === undefined),
        }}
        type="search"
        value={props.value ?? ""}
        disabled={props.disabled}
        spellcheck={false}
        autocapitalize="none"
        onInput={(e) => {
          const val = e.currentTarget.value;
          if (
            props.finishKey === "Space" &&
            val.charAt(val.length - 1) === " "
          ) {
            tryFinish();
            e.preventDefault();
            e.currentTarget.value = props.value ?? "";
          } else {
            props.onInput(val);
          }
        }}
        onKeyPress={(e) => {
          if (props.finishKey === "Enter" && e.key === "Enter") {
            tryFinish();
            e.preventDefault();
          }
        }}
        onKeyDown={(e) => {
          if (
            e.key === "Backspace" &&
            (props.value === "" || props.value === undefined)
          ) {
            e.preventDefault();
            props.onEscape();
          }
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          if (!hasMouseDown()) setFocused(false);
        }}
      />
      <Show
        when={
          props.options !== undefined && props.options.length !== 0 && focused()
        }
      >
        <div class={styles.keyDropdown}>
          <For each={props.options}>
            {(option) => (
              <button
                onFocus={() => setFocused(true)}
                onMouseDown={() => setHasMouseDown(true)}
                onMouseUp={() => setHasMouseDown(false)}
                onClick={() => {
                  props.onInput(option);
                  setFocused(false);
                }}
              >
                {option}
              </button>
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};

const FilterComponent: Component<{
  filter: Filter | BlankFilter;
  setFilter: (filter: Partial<Filter>) => void;
  focusOmnisearch: () => void;
  removeSelf: () => void;
}> = (props) => {
  const keyOptions = createMemo(() => {
    if (props.filter.key === undefined) return filterKeys;
    return filterKeys
      .filter((key) => key.includes(props.filter.key!))
      .sort(hammingDistanceFrom(props.filter.key));
  });

  type States = "key" | "value" | "use";
  // if filter is made from url data, it is ready to use
  const [state, setState] = createSignal<States>(
    props.filter.use ? "use" : "key"
  );

  // make use true if the filter validates
  createEffect(() => {
    if (state() === "use") {
      props.setFilter({ use: true });
      props.focusOmnisearch();
    } else {
      props.setFilter({ use: false });
    }
  });

  return (
    <>
      <SmartInput
        value={props.filter.key}
        valid={filterKeys.includes(props.filter.key ?? "")}
        options={keyOptions()}
        focus={state() === "key"}
        disabled={state() === "use" || state() === "value"}
        finishKey="Space"
        onFinish={() => {
          setState("value");
        }}
        onEscape={props.removeSelf}
        onInput={(s) => {
          props.setFilter({ key: s });
        }}
      />
      <SmartInput
        value={props.filter.value}
        valid={
          typeof props.filter.value === "string" &&
          props.filter.value.length > 0
        }
        options={undefined}
        focus={state() === "value"}
        disabled={state() === "key"}
        finishKey="Enter"
        onFinish={() => {
          setState("use");
        }}
        onEscape={() => {
          setState("key");
        }}
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

// this regex is used to match the filter keys
const isFilter = /^f_/;

const Omnisearch: Component<{}> = () => {
  let ref: HTMLInputElement | undefined;
  const focusOmnisearch = () => {
    ref?.focus();
  };
  const [searchParams, setSearchParams] = useSearchParams();

  const [search, setSearch] = createStore({
    query: searchParams.query ?? "",
    filters: Object.entries(searchParams)
      .filter(([key]) => isFilter.test(key))
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

  // keep search params up to date with store filters, query
  createEffect(() => {
    setSearchParams(
      search.filters.reduce(
        (acc, filter) => {
          if (!filter.use) return acc;
          acc[`f_${filter.key}`] = filter.value;
          return acc;
        },
        Object.entries(searchParams).reduce(
          (acc, [key]) => {
            if (key === "query") return acc;
            else acc[key] = null;
            return acc;
          },
          { query: search.query } as Record<string, string | null>
        )
      )
    );
  });
  const setQuery = (query: string) => {
    setSearch("query", query);
    // setSearchParams({ query });
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
