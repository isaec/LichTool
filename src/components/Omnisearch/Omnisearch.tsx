import MiniSearch, { SearchResult } from "minisearch";
import { DataSpell } from "@components/Renderer/types";
import { spellArray, spellMap, filterKeys } from "@src/dataLookup";
import {
  batch,
  Component,
  createComputed,
  createEffect,
  createMemo,
  createSignal,
  For,
  Show,
  untrack,
} from "solid-js";
import { createStore } from "solid-js/store";
import { Results } from "./SearchResult";

import styles from "./Omnisearch.module.scss";
import { schoolAbbreviationMap } from "@components/generalTypes";
import { useSearchParams } from "solid-app-router";
import { hammingDistanceFrom } from "@src/hamming";
import { createDebouncedMemo } from "@solid-primitives/memo";
import toast from "solid-toast";

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
      // if the input is not valid
      !props.valid &&
      // and there are no valid options
      (props.options === undefined || props.options.length === 0)
    ) {
      // return, we can't finish yet
      return;
    }
    // if the input is invalid but there are valid options
    if (!props.valid) {
      // pretend the user typed the best valid option
      props.onInput(props.options![0]);
    }
    // call the finish function, which will advance focus, state
    props.onFinish();
  };
  return (
    <div
      classList={{
        [styles.smartInput]: true,
        [styles.valid]: props.valid,
      }}
    >
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
                  tryFinish();
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
    switch (true) {
      case state() === "use":
        props.focusOmnisearch();
      // fallthrough
      case state() === "value" && typeof props.filter.value === "string":
        props.setFilter({ use: true });
        break;
      default:
        props.setFilter({ use: false });
        break;
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

/**
 * this is a cache of parsed filters, but only expensive filters will be cached
 */
const filterParseMap = new Map<string, ReturnType<typeof parseFilter>>();

const isOnlyDigits = /^\d+$/;
// flags m i and u aren't that useful, but are allowed
// i is the most useful of them
const isValidRegex = /^\/(.+)\/([miu]*)$/;
const parseFilter = (
  filter: string
): boolean | number | RegExp | string | null => {
  if (filter === "true" || filter === "false") return filter ? true : false;
  if (isOnlyDigits.test(filter)) return parseInt(filter);
  if (isValidRegex.test(filter)) {
    // it would be faster for regex to read cache earlier and not need to test
    // but only checking cache for valid regex speeds up other cases
    if (filterParseMap.has(filter)) return filterParseMap.get(filter)!;
    const [, regex, flags] = isValidRegex.exec(filter)!;
    try {
      const val = new RegExp(regex, flags);
      filterParseMap.set(filter, val);
      return val;
    } catch (e) {
      // this prevents the immense cost of parsing invalid regex 1000x
      filterParseMap.set(filter, null);
      // this removes the invalid regex from the cache
      setTimeout(() => filterParseMap.delete(filter), 1000);
      toast.error((e as Error).message);
      return null;
    }
  }
  return filter.toLowerCase();
};

const filterValueTransforms = new Map([["school", schoolAbbreviationMap]]);

/**
 * @param dataObj the data object to filter based on
 * @param filterObj the details of the filter to apply
 * @returns true if the data object matches the filter
 */
const testFilter = (dataObj: DataSpell, filterObj: PopulatedFilter) => {
  const filter = parseFilter(filterObj.value);
  if (filter === null) return false;
  const key = filterObj.key;
  const val = dataObj[key as keyof DataSpell];
  if (filter instanceof RegExp) {
    return filter.test((val ?? "").toString());
  }
  if (typeof filter === "number" || typeof filter === "boolean")
    return val === filter;
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
  const filterFn = (result: SearchResult) => {
    const dataObj = spellMap.get(result.id)!;
    return !populatedFilters().some((filter) => !testFilter(dataObj, filter));
  };
  const results = createMemo((): SearchResult[] => {
    // show everything if there are no params
    if (debouncedQuery().length === 0 && populatedFilters().length === 0) {
      return [...spellMap.values()] as unknown as SearchResult[];
    }
    if (debouncedQuery().length === 0) {
      // filter without any search
      return [...spellMap.values()].filter((data) =>
        // EVIL CODE EVIL CODE EVIL CODE EVIL CODE
        // this is a nasty hack to simulate a search without a search
        // if filterFn starts reading other keys this will break
        // if searchResult starts reading other keys this will break
        filterFn({
          // id key is there but not in the types...
          // @ts-expect-error
          id: data.id,
        } as SearchResult)
      ) as unknown as SearchResult[];
    }
    return searchEngine.search(debouncedQuery(), {
      filter: populatedFilters().length === 0 ? undefined : filterFn,
    });
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
