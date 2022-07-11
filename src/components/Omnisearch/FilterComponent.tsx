import { filterKeys } from "@src/dataLookup";
import { hammingDistanceFrom } from "@src/hamming";
import {
  Component,
  createSignal,
  createEffect,
  Show,
  For,
  createMemo,
} from "solid-js";
import { Filter, BlankFilter } from "./filterEngine";

import styles from "./Omnisearch.module.scss";

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

export default FilterComponent;
