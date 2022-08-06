import { filterKeys, filterMap } from "@src/dataLookup";
import { hammingDistanceFrom } from "@util/hamming";
import {
  Component,
  createSignal,
  createEffect,
  Show,
  For,
  createMemo,
  createSelector,
} from "solid-js";
import toast from "solid-toast";
import { Filter, BlankFilter, filterIsValid } from "./filterEngine";

import styles from "./Omnisearch.module.scss";

const SmartInput: Component<{
  /* undefined union means it must be passed but can be undefined */
  value: string | undefined;
  options: string[] | undefined;
  focus: boolean;
  valid: boolean;
  disabled?: boolean;
  dotComplete?: boolean;
  finishKey: "Enter" | "Space";
  onFinish: () => void;
  onEscape: () => void;
  onInput: (value: string) => void;
  onFocus: () => void;
}> = (props) => {
  const [focused, setFocused] = createSignal(false);
  const [hasMouseDown, setHasMouseDown] = createSignal(false);
  // this is used to determine if focus loss is because of escape key
  const [triggeredEscape, setTriggeredEscape] = createSignal(false);

  const escape = () => {
    props.onInput("");
    setTriggeredEscape(true);
    props.onEscape();
  };

  let ref: HTMLInputElement | undefined;
  createEffect(() => {
    if (props.focus) ref?.focus();
  });
  const tryFinish = () => {
    if (props.valid) {
      props.onFinish();
      return;
    }
    if (
      // if the input is not valid
      !props.valid &&
      // and there are no valid options
      (props.options === undefined || props.options.length === 0)
    ) {
      toast.error("Invalid filter");
      // return, we can't finish yet
      return;
    }
    // if the input is invalid but there are valid options
    if (!props.valid) {
      const best = props.options![0];
      // if there is only one option at this depth or no dots, use it
      if (props.options!.length === 1 || !props.dotComplete) {
        props.onInput(best);
        // call the finish function, which will advance focus, state
        props.onFinish();
      } else {
        // this is deep autocomplete
        // pretend the user typed the minimum subpath to the best option

        // the index of where the user has typed to
        const cursor = best.indexOf(props.value!) + props.value!.length;
        const index = best.indexOf(".", cursor);
        // if there are no more dots, best option is a full path
        if (index === -1) {
          props.onInput(best);
          props.onFinish();
        } else {
          const subpath = best.substring(0, index + 1);
          console.log("subpath", subpath);
          props.onInput(subpath);
        }
      }
    }
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
        type={props.finishKey === "Enter" ? "search" : "text"}
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
            e.currentTarget.selectionStart === 0 &&
            e.currentTarget.selectionEnd === 0
          ) {
            e.preventDefault();
            escape();
          }
        }}
        onFocus={() => {
          setFocused(true);
          props.onFocus();
        }}
        onBlur={() => {
          if (!hasMouseDown()) {
            setFocused(false);
            if (!triggeredEscape()) {
              tryFinish();
            } else {
              // flip the flag back to false
              setTriggeredEscape(false);
            }
          }
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
  isFocused: boolean;
  onGainedFocus: () => void;
  onFinish: () => void;
  removeSelf: () => void;
}> = (props) => {
  const filterIsValidMemo = createMemo(() => filterIsValid(props.filter));
  // keep filter use property in sync with filter validity
  createEffect(() => {
    props.setFilter({ use: filterIsValidMemo() });
  });

  const keyOptions = createMemo(() => {
    if (props.filter.key === undefined) return filterKeys;
    return filterKeys
      .filter((key) => key.includes(props.filter.key!))
      .sort(hammingDistanceFrom(props.filter.key));
  });

  // much jank!
  const valueOptions = createMemo((): string[] | undefined => {
    if (props.filter.key === undefined || !filterMap.has(props.filter.key))
      return undefined;
    if (props.filter.value === undefined)
      return filterMap.get(props.filter.key)!.map((v) => v.toString());
    return (
      filterMap
        .get(props.filter.key)!
        // temporary toString
        .map((value) => value.toString())
        .filter((value) =>
          value.toLowerCase().includes(props.filter.value!.toLowerCase())
        )
        .sort(hammingDistanceFrom(props.filter.value))
    );
  });

  type States = "key" | "value";
  // if filter is made from url data, we can start in the value state
  // if use is true at component inception, we know the filter is made from url data
  // this code only runs once and is not in a reactive scope, thats why this works
  const [state, setState] = createSignal<States>(
    props.filter.use ? "value" : "key"
  );
  const isState = createSelector(state);

  const onFocus = () => {
    if (!props.isFocused) props.onGainedFocus();
  };

  return (
    <>
      <SmartInput
        value={props.filter.key}
        valid={filterKeys.includes(props.filter.key ?? "")}
        options={keyOptions()}
        dotComplete
        focus={isState("key") && props.isFocused}
        disabled={isState("value")}
        finishKey="Space"
        onFinish={() => {
          setState("value");
        }}
        onEscape={props.removeSelf}
        onInput={(s) => {
          props.setFilter({ key: s });
        }}
        onFocus={onFocus}
      />
      <SmartInput
        value={props.filter.value}
        valid={filterIsValid(props.filter)}
        options={valueOptions()}
        focus={isState("value") && props.isFocused}
        disabled={isState("key")}
        finishKey="Enter"
        onFinish={() => {
          // this would ideally be done lower, but
          // SmartInput loosing focus doesn't mean FilterComponent looses focus
          // eg clicking on autocomplete
          if (props.isFocused) props.onFinish();
        }}
        onEscape={() => {
          setState("key");
        }}
        onInput={(s) => {
          props.setFilter({ value: s });
        }}
        onFocus={onFocus}
      />
    </>
  );
};

export default FilterComponent;
