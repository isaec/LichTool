import { Component, createMemo, For, Match, Switch } from "solid-js";
import { DataSpell } from "./types";

import styles from "./DataSpellElement.module.scss";
import { schoolAbbreviationMap } from "@components/generalTypes";

const durationMap = new Map([["instant", "Instantaneous"]]);

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
      <p>
        <b>Casting time: </b>
        {props.data.time[0].number} {props.data.time[0].unit}
      </p>
      <p>
        <b>Range: </b>
        {props.data.range.type} {props.data.range.distance.amount}{" "}
        {props.data.range.distance.type}
      </p>
      <p>
        <b>Components: </b>
        {components()}
      </p>
      <p>
        <b>Duration: </b>
        {durationMap.get(props.data.duration[0].type)}
      </p>
    </div>
  );
};

export default DataSpellElement;
