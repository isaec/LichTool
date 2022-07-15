import { Component, createMemo, JSX, Match, Show, Switch } from "solid-js";
import styles from "./DataElement.module.scss";
import { schoolAbbreviationMap } from "@src/generalTypes";
import { DataGroupRenderer, RendererStyles } from "../Renderer";
import { fmtDuration, fmtRange } from "@util/formatter";
import { RawDataSpell } from "@src/dataLookup";
import KeyValue from "./KeyValue";
import DataFooter from "./DataFooter";
import DataHeader from "./DataHeader";
import { DataBodyEntries, Entries } from "./DataBodyEntries";

const plural = (num: number, str: string) =>
  `${num} ${str}${num > 1 ? "s" : ""}`;

const DataSpellElement: Component<{
  data: RawDataSpell;
}> = (props) => {
  const components = createMemo(() =>
    Object.entries(props.data.components)
      .filter(([, value]) => value !== false && value !== undefined)
      .map(([component, value]) => {
        const key = component.toUpperCase();
        switch (true) {
          case value === true:
            return key;
          case typeof value === "string":
            return `${key} (${value})`;
          case typeof value === "object":
            return `${key} (${(value as { text: string }).text})`;
        }
      })
      .join(", ")
  );
  return (
    <div class={styles.DataElement}>
      <DataHeader data={props.data} />
      <i>
        <Switch>
          <Match when={props.data.level === 0}>Cantrip</Match>
          <Match when={props.data.level === 1}>1st-level</Match>
          <Match when={props.data.level === 2}>2nd-level</Match>
          <Match when={props.data.level === 3}>3rd-level</Match>
          <Match when={props.data.level >= 4}>{props.data.level}th-level</Match>
        </Switch>{" "}
        {schoolAbbreviationMap.get(props.data.school)}
        <Show when={props.data.meta?.ritual === true}> (ritual)</Show>
      </i>
      <KeyValue key={"Casting time"}>
        {props.data.time[0].number} {props.data.time[0].unit}
      </KeyValue>
      <KeyValue key={"Range"}>{fmtRange(props.data.range)}</KeyValue>
      <KeyValue key={"Components"}>{components()}</KeyValue>
      <KeyValue key={"Duration"}>
        {fmtDuration(props.data.duration[0])}
      </KeyValue>
      <Entries data={props.data} />
      <DataFooter data={props.data} />
    </div>
  );
};

export default DataSpellElement;
