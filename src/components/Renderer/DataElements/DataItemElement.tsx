import { DataItem, RawData } from "@src/dataLookup";
import { argList, capitalize, fmtCurrency } from "@src/util/formatter";
import { allDefined } from "@src/util/validation";
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
    <Show when={props.data.weaponCategory}>
      <i>{capitalize(props.data.weaponCategory!)} weapon</i>
    </Show>
    <HorizontalPair>
      <p>
        {argList(fmtCurrency(props.data.value!), [props.data.weight, "lb."])}
      </p>
      <Show when={props.data.template !== undefined}>
        <p>
          <Show when={allDefined(props.data.dmg1, props.data.dmgType)}>
            {props.data.dmg1} {props.data.dmgType}
            {" - "}
          </Show>
          {props.data.template}
        </p>
      </Show>
    </HorizontalPair>
    <Entries data={props.data} />
    <DataFooter data={props.data} />
  </div>
);

export default DataItemElement;
