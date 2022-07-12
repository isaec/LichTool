import { DataUnion, RawData } from "@src/dataLookup";
import { Component } from "solid-js";
import { DataGroupRenderer, RendererStyles } from "../Renderer";

import styles from "./DataElement.module.scss";
import DataFooter from "./DataFooter";
import DataHeader from "./DataHeader";

const DataGenericElement: Component<{
  data: RawData<DataUnion>;
}> = (props) => (
  <div class={styles.DataElement}>
    <DataHeader data={props.data} />
    <RendererStyles>
      <DataGroupRenderer group={props.data.entries} entryLevel={2} />
    </RendererStyles>
    <DataFooter data={props.data} />
  </div>
);

export default DataGenericElement;
