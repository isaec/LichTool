import { DataUnion, RawData } from "@src/dataLookup";
import { Component } from "solid-js";
import { DataGroupRenderer, RendererStyles } from "../Renderer";

import styles from "./DataElement.module.scss";
import DataFooter from "./DataFooter";

const DataGenericElement: Component<{
  data: RawData<DataUnion>;
}> = (props) => (
  <div class={styles.DataElement}>
    <div class={styles.head}>
      <h2>{props.data.name}</h2>
      <h2>
        {props.data.source} <small>p{props.data.page}</small>
      </h2>
    </div>
    <RendererStyles>
      <DataGroupRenderer group={props.data.entries} entryLevel={2} />
    </RendererStyles>
    <DataFooter data={props.data} />
  </div>
);

export default DataGenericElement;
