import { DataItem, RawData } from "@src/dataLookup";
import { argList, fmtCurrency } from "@src/util/formatter";
import { Component, Show } from "solid-js";
import { Entries } from "./DataBodyEntries";

import styles from "./DataElement.module.scss";
import DataFooter from "./DataFooter";
import DataHeader from "./DataHeader";
import HorizontalPair from "./HorizontalPair";

const DataItemElement: Component<{
  data: RawData<DataItem>;
}> = (props) => (
  <div class={styles.DataElement}>
    <DataHeader data={props.data} />
    <i>{props.data.type}</i>
    <HorizontalPair>
      <p>
        {argList(fmtCurrency(props.data.value!), [props.data.weight, "lb."])}
      </p>
      <Show when={props.data.template !== undefined}>
        <p>{props.data.template}</p>
      </Show>
    </HorizontalPair>
    <Entries data={props.data} />
    <DataFooter data={props.data} />
  </div>
);

export default DataItemElement;
