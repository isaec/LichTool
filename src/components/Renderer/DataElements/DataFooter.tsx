import { DataUnion, RawData } from "@src/dataLookup";
import { Component, Show } from "solid-js";
import KeyValue from "./KeyValue";

const DataFooter: Component<{
  data: RawData<DataUnion>;
}> = (props) => (
  <KeyValue key="Source">
    <i>{props.data.source},</i> page {props.data.page}.
    <Show when={props.data.srd === true}> Available in the SRD.</Show>
  </KeyValue>
);

export default DataFooter;
