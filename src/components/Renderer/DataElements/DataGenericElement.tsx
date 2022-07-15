import { DataUnion, RawData } from "@src/dataLookup";
import { Component, Show } from "solid-js";
import { DataGroupRenderer, RendererStyles } from "../Renderer";
import { DataBodyEntries, Entries } from "./DataBodyEntries";

import styles from "./DataElement.module.scss";
import DataFooter from "./DataFooter";
import DataHeader from "./DataHeader";

const DataGenericElement: Component<{
  data: RawData<DataUnion>;
}> = (props) => (
  <div class={styles.DataElement}>
    <DataHeader data={props.data} />
    <Entries data={props.data} />
    <DataFooter data={props.data} />
  </div>
);

export default DataGenericElement;
