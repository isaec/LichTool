import { DataUnion, RawData } from "@src/dataLookup";
import { Component } from "solid-js";

import styles from "./DataElement.module.scss";

const DataHeader: Component<{
  data: RawData<DataUnion>;
}> = (props) => (
  <div class={styles.DataHeader}>
    <h2>{props.data.name}</h2>
    <h2>
      {props.data.source} <small>p{props.data.page}</small>
    </h2>
  </div>
);

export default DataHeader;
