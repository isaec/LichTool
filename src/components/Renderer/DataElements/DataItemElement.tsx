import { DataItem, RawData } from "@src/dataLookup";
import {
  argList,
  capitalize,
  fmtCurrency,
  fmtItemType,
} from "@src/util/formatter";
import { allDefined } from "@src/util/validation";
import { Component, createMemo, Show } from "solid-js";
import { Entries } from "./DataBodyEntries";

import styles from "./DataElement.module.scss";
import DataFooter from "./DataFooter";
import DataHeader from "./DataHeader";
import HorizontalPair from "./HorizontalPair";

const DataItemElement: Component<{
  data: RawData<DataItem>;
}> = (props) => {
  const types = createMemo(() => fmtItemType(props.data));
  return (
    <div class={styles.DataElement}>
      <DataHeader data={props.data} />
      <i>{types()[0]}</i>
      <i>{types()[1]}</i>
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
};

export default DataItemElement;
