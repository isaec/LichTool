import { Component, createMemo, For, JSX, Match, Switch } from "solid-js";
import { DataSpell } from "./types";

import styles from "./DataSpellElement.module.scss";
import { schoolAbbreviationMap } from "@components/generalTypes";
import { DataGroupRenderer } from "./Renderer";

const durationMap = new Map([["instant", "Instantaneous"]]);

const KeyValue: Component<{ key: string; children: JSX.Element }> = (props) => (
  <p>
    <b>{`${props.key}: `}</b>
    {props.children}
  </p>
);

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
        {props.data.range.type} {props.data.range.distance.amount}{" "}
        {props.data.range.distance.type}
      </KeyValue>
      <KeyValue key={"Components"}>{components()}</KeyValue>
      <KeyValue key={"Duration"}>
        {durationMap.get(props.data.duration[0].type)}
      </KeyValue>
      <DataGroupRenderer group={props.data.entries} />
    </div>
  );
};

export default DataSpellElement;
