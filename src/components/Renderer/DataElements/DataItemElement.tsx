import { DataItem, RawData } from "@src/dataLookup";
import { Component, Show } from "solid-js";
import { Entries } from "./DataBodyEntries";

import styles from "./DataElement.module.scss";
import DataFooter from "./DataFooter";
import DataHeader from "./DataHeader";

const DataItemElement: Component<{
  data: RawData<DataItem>;
}> = (props) => (
  <div class={styles.DataElement}>
    <DataHeader data={props.data} />
    <i>{props.data.type}</i>
    <Entries data={props.data} />
    <DataFooter data={props.data} />
  </div>
);

export default DataItemElement;
