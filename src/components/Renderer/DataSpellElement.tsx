import { Component, createMemo, For, JSX, Match, Show, Switch } from "solid-js";
import { DataSpell, EntriesData, EntryLevels } from "./types";

import styles from "./DataSpellElement.module.scss";
import { schoolAbbreviationMap } from "@components/generalTypes";
import { DataGroupRenderer } from "./Renderer";

const KeyValue: Component<{ key: string; children: JSX.Element }> = (props) => (
  <p>
    <b>{`${props.key}: `}</b>
    {props.children}
  </p>
);

const plural = (num: number, str: string) =>
  `${num} ${str}${num > 1 ? "s" : ""}`;

const DataSpellElement: Component<{
  data: DataSpell;
}> = (props) => {
  const components = createMemo(() =>
    Object.entries(props.data.components)
      .map(([component, value]) =>
        value === true
          ? component.toUpperCase()
          : `${component.toUpperCase()} (${value})`
      )
      .join(", ")
  );
  return (
    <div class={styles.DataSpellElement}>
      <div class={styles.head}>
        <h2>{props.data.name}</h2>
        <h2>
          {props.data.source} <small>p{props.data.page}</small>
        </h2>
      </div>
      <i>
        <Switch>
          <Match when={props.data.level === 0}>Cantrip</Match>
          <Match when={props.data.level === 1}>1st-level</Match>
          <Match when={props.data.level === 2}>2nd-level</Match>
          <Match when={props.data.level === 3}>3rd-level</Match>
          <Match when={props.data.level >= 4}>{props.data.level}th-level</Match>
        </Switch>{" "}
        {schoolAbbreviationMap.get(props.data.school)}
      </i>
      <KeyValue key={"Casting time"}>
        {props.data.time[0].number} {props.data.time[0].unit}
      </KeyValue>
      <KeyValue key={"Range"}>
        <Switch
          fallback={
            <>
              {props.data.range.type}{" "}
              <Show when={props.data.range.distance !== undefined}>
                {props.data.range.distance!.amount}{" "}
                {props.data.range.distance!.type}
              </Show>
            </>
          }
        >
          <Match when={props.data.range.type === "point"}>
            {props.data.range.distance!.amount}{" "}
            {props.data.range.distance!.type}
          </Match>
        </Switch>
      </KeyValue>
      <KeyValue key={"Components"}>{components()}</KeyValue>
      <KeyValue key={"Duration"}>
        <Switch fallback={props.data.duration[0].type}>
          <Match when={props.data.duration[0].type === "timed"}>
            {plural(
              props.data.duration[0].duration!.amount,
              props.data.duration[0].duration!.type
            )}
          </Match>
          <Match when={props.data.duration[0].type === "instant"}>
            Instantaneous
          </Match>
        </Switch>
      </KeyValue>
      <DataGroupRenderer group={props.data.entries} entryLevel={2} />
      <Show when={props.data.entriesHigherLevel !== undefined}>
        <DataGroupRenderer
          group={props.data.entriesHigherLevel!}
          entryLevel={2}
        />
      </Show>
    </div>
  );
};

export default DataSpellElement;
