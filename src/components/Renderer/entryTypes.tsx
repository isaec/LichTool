import {
  Component,
  createMemo,
  FlowComponent,
  For,
  JSX,
  Match,
  mergeProps,
  Show,
  Switch,
} from "solid-js";
import { DataGroupRenderer, DataRenderer } from "./Renderer";
import {
  BonusData,
  InsetData,
  isDataNode,
  ListData,
  listStyles,
  QuoteData,
  SectionData,
  BonusSpeedData,
  InsetReadaloudData,
  DataSpellData,
  EntriesData,
  EntryLevels,
  VariantData,
} from "./types";

import styles from "./Renderer.module.scss";
import DataSpellElement from "./DataSpellElement";
import RenderError from "./RenderError";

const ListItem: Component<{ condition: boolean; children: JSX.Element }> = (
  props
) => (props.condition ? props.children : <li>{props.children}</li>);

/**
 * adds a period if last char is not a period, and includes space regardless.
 */
const addPeriod = (str?: string) =>
  str === undefined ? "" : str.endsWith(".") ? `${str} ` : `${str}. `;

export const section = (props: { data: SectionData }) => (
  <>
    <h1>{props.data.name}</h1>
    <DataGroupRenderer group={props.data.entries} />
  </>
);
export const list = (props: { data: ListData }) => {
  const classes = createMemo(() => {
    // if there is no style, we don't need to give it a class
    if (props.data.style === undefined) return "";
    // if there is only one style, give it the appropriate class
    if (listStyles.has(props.data.style)) return styles[props.data.style];

    // otherwise, build up a string of each converted style
    const classStack: Array<string> = [];
    listStyles.forEach((style) => {
      if (props.data.style!.includes(style)) classStack.push(styles[style]);
    });
    return classStack.join(" ");
  });
  return (
    <>
      <Show when={props.data.name !== undefined}>
        <b>{props.data.name}</b>
      </Show>
      <ul
        classList={{
          [styles.list]: true,
          [styles.column]: typeof props.data.columns === "number",
          [classes()]: true,
        }}
        style={
          typeof props.data.columns === "number"
            ? {
                "column-count": props.data.columns,
              }
            : undefined
        }
      >
        <For each={props.data.items}>
          {(item) => (
            <ListItem condition={isDataNode(item) && item.type === "list"}>
              <DataRenderer data={item} />
            </ListItem>
          )}
        </For>
      </ul>
    </>
  );
};
export const inset = (props: { data: InsetData }) => (
  <div class={styles.inset}>
    <h4>{props.data.name}</h4>
    {<DataRenderer data={props.data.entries} />}
  </div>
);
export const insetReadaloud = (props: { data: InsetReadaloudData }) => (
  <div classList={{ [styles.inset]: true, [styles.readaloud]: true }}>
    <h4>{props.data.name}</h4>
    {<DataRenderer data={props.data.entries} />}
  </div>
);
export const variant = (props: { data: VariantData }) => (
  <div class={styles.inset}>
    <h4>{props.data.name}</h4>
    {<DataRenderer data={props.data.entries} entryLevel={2} />}
  </div>
);
export const variantSub = (props: { data: VariantData }) => (
  <DataGroupRenderer
    group={props.data.entries}
    entryLevel={2}
    wrapper={(wProps) => (
      <div class={styles.inlineHeader}>
        <i>{addPeriod(props.data.name)}</i>
        {wProps.children}
      </div>
    )}
  />
);
export const quote = (props: { data: QuoteData }) => {
  const entries = createMemo(() => {
    // if we only have one string, quote it
    if (
      props.data.entries.length === 1 &&
      typeof props.data.entries[0] === "string"
    ) {
      return [`"${props.data.entries}"`];
    }

    // we have many things, but some elements may be strings
    const arr = props.data.entries.slice(1, -1);

    if (typeof props.data.entries[0] === "string") {
      arr.unshift(`"${props.data.entries[0]}`);
    } else {
      arr.unshift(`"`);
      arr.unshift(props.data.entries[0]); // also add the missing non string element
    }

    if (typeof props.data.entries[props.data.entries.length - 1] === "string") {
      arr.push(`${props.data.entries[props.data.entries.length - 1]}"`);
    } else {
      arr.push(props.data.entries[props.data.entries.length - 1]); // add the missing non string element
      arr.push(`"`);
    }

    return arr;
  });
  return (
    <figure>
      <DataGroupRenderer group={entries()} wrapper={"blockquote"} />
      <Show when={typeof (props.data.by ?? props.data.from) !== undefined}>
        <figcaption>
          — {props.data.by}
          <Show
            when={
              typeof props.data.by === "string" &&
              typeof props.data.from === "string"
            }
          >
            ,{" "}
          </Show>
          <cite>{props.data.from}</cite>
        </figcaption>
      </Show>
    </figure>
  );
};
export const bonus = (props: { data: BonusData }) => (
  <span>
    <Show when={props.data.value >= 0}>+</Show>
    {props.data.value}
  </span>
);
export const bonusSpeed = (props: { data: BonusSpeedData }) => (
  <span>
    <Show when={props.data.value >= 0}>+</Show>
    {props.data.value}
    {" ft."}
  </span>
);
export const dataSpell = (props: { data: DataSpellData }) => (
  <DataSpellElement data={props.data.dataSpell} />
);
export const entries = (props: {
  data: EntriesData;
  entryLevel?: EntryLevels;
}) => {
  const merged = mergeProps({ entryLevel: 0 }, props);
  return (
    <Switch
      fallback={
        <RenderError
          error={`unexpected entry nest depth ${merged.entryLevel}`}
        />
      }
    >
      <Match when={merged.entryLevel === 0}>
        <div>
          <Show when={merged.data.name !== undefined}>
            <h2>{merged.data.name}</h2>
          </Show>
          <DataGroupRenderer
            group={merged.data.entries}
            entryLevel={Math.min(merged.entryLevel + 1, 2) as 0 | 1 | 2}
          />
        </div>
      </Match>
      <Match when={merged.entryLevel === 1}>
        <div>
          <Show when={merged.data.name !== undefined}>
            <h3>{merged.data.name}</h3>
          </Show>
          <DataGroupRenderer
            group={merged.data.entries}
            entryLevel={Math.min(merged.entryLevel + 1, 2) as 0 | 1 | 2}
          />
        </div>
      </Match>
      <Match when={merged.entryLevel === 2}>
        <div>
          <DataGroupRenderer
            group={merged.data.entries}
            entryLevel={Math.min(merged.entryLevel + 1, 2) as 0 | 1 | 2}
            wrapper={(wProps) => (
              <div class={styles.inlineHeader}>
                <b>
                  <i>{addPeriod(merged.data.name)}</i>
                </b>
                {wProps.children}
              </div>
            )}
          />
        </div>
      </Match>
    </Switch>
  );
};
