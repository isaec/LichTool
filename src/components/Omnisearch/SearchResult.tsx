import { dataArray, dataMap } from "@src/dataLookup";
import { Accessor, Component, createMemo, For, JSX, Show } from "solid-js";
import { Levels, schoolAbbreviationMap } from "@components/generalTypes";
import { DataSpell } from "@components/Renderer/types";
import { fmtRange } from "@src/formatter";

import styles from "./SearchResult.module.scss";
import { Navigate, useNavigate } from "solid-app-router";

const Data: Component<{
  children: JSX.Element;
  nowrap?: boolean;
  mono?: boolean;
  optional?: boolean;
}> = (props) => (
  <td
    classList={{
      [styles.Data]: true,
      [styles.nowrap]: props.nowrap,
      [styles.mono]: props.mono,
      [styles.optional]: props.optional,
    }}
  >
    {props.children === true ? "x" : props.children}
  </td>
);

const Key: Component<{ children: string }> = (props) => (
  <th class={styles.Key} scope="row">
    {props.children}
  </th>
);

const TableRow: Component<{
  id: string;
  children: JSX.Element;
}> = (props) => {
  const navigate = useNavigate();

  return (
    <tr
      class={styles.TableRow}
      onClick={() => {
        navigate(`/view/${props.id}`);
      }}
    >
      {props.children}
    </tr>
  );
};

export const SearchResult: Component<{ id: string }> = (props) => {
  const dataObj = createMemo(() =>
    dataMap.get(props.id)
  ) as Accessor<DataSpell>;
  return (
    <TableRow id={props.id}>
      <Key>{dataObj().name}</Key>
      <Data mono nowrap>
        {dataObj().level}
      </Data>
      <Data mono nowrap>
        {schoolAbbreviationMap.get(dataObj().school)!.slice(0, 5)}
      </Data>
      <Data>{fmtRange(dataObj().range, true)}</Data>
      <Data nowrap optional>
        {dataObj().duration[0].concentration}
      </Data>
      <Data nowrap optional>
        {dataObj().meta?.ritual}
      </Data>
      <Data nowrap>{dataObj().source}</Data>
    </TableRow>
  );
};

export const Results: Component<{ results: { id: string }[] }> = (props) => (
  <div class={styles.resultsWrapper}>
    <table class={styles.results}>
      <thead></thead>
      <For each={props.results}>
        {(result) => <SearchResult id={result.id} />}
      </For>
    </table>
  </div>
);
