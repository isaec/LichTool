import { spellMap } from "@src/dataLookup";
import { Accessor, Component, createMemo, For, JSX, Show } from "solid-js";
import { Levels, schoolAbbreviationMap } from "./generalTypes";
import { DataSpell } from "./Renderer/types";
import { fmtRange } from "@src/formatter";

import styles from "./SearchResult.module.scss";
import { Navigate, useNavigate } from "solid-app-router";

const Data: Component<{
  children: JSX.Element;
  nowrap?: boolean;
  mono?: boolean;
}> = (props) => (
  <td
    classList={{
      [styles.Data]: true,
      [styles.nowrap]: props.nowrap,
      [styles.mono]: props.mono,
    }}
  >
    {props.children}
  </td>
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

const fmtLevel = (level: Levels, ritual?: boolean) => {
  if (level === 0) return "Cantrip";
  if (ritual) return `lvl ${level} rit`;
  return `lvl ${level}`;
};

export const SearchResult: Component<{ id: string }> = (props) => {
  const dataObj = createMemo(() =>
    spellMap.get(props.id)
  ) as Accessor<DataSpell>;
  return (
    <TableRow id={props.id}>
      <Data>{dataObj().name}</Data>
      <Data nowrap>{fmtLevel(dataObj().level, dataObj().meta?.ritual)}</Data>
      <Data mono nowrap>
        {schoolAbbreviationMap.get(dataObj().school)!.slice(0, 5)}
      </Data>
      <Data>{fmtRange(dataObj().range)}</Data>
      <Data nowrap>
        {dataObj().duration[0].concentration !== undefined ? "x" : ""}
      </Data>
      <Data nowrap>{dataObj().source}</Data>
    </TableRow>
  );
};

export const Results: Component<{ results: { id: string }[] }> = (props) => (
  <div class={styles.resultsWrapper}>
    <table class={styles.results}>
      <For each={props.results}>
        {(result) => <SearchResult id={result.id} />}
      </For>
    </table>
  </div>
);
