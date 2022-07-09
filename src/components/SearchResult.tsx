import { spellMap } from "@src/dataLookup";
import { Accessor, Component, createMemo, JSX, Show } from "solid-js";
import { Levels, schoolAbbreviationMap } from "./generalTypes";
import { DataSpell } from "./Renderer/types";
import { fmtRange } from "@src/formatter";

import styles from "./SearchResult.module.scss";
import { Navigate, useNavigate } from "solid-app-router";

const Chip: Component<{
  children: JSX.Element;
  final?: boolean;
  primary?: boolean;
  nowrap?: boolean;
  mono?: boolean;
}> = (props) => (
  <p
    classList={{
      [styles.chip]: true,
      [styles.primary]: props.primary,
      [styles.final]: props.final,
      [styles.nowrap]: props.nowrap,
      [styles.mono]: props.mono,
    }}
  >
    {props.children}
  </p>
);

const ChipRow: Component<{
  id: string;
  children: JSX.Element;
}> = (props) => {
  const navigate = useNavigate();

  return (
    <div
      class={styles.chipRow}
      onClick={() => {
        navigate(`/view/${props.id}`);
      }}
    >
      {props.children}
    </div>
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
    <ChipRow id={props.id}>
      <Chip primary>{dataObj().name}</Chip>
      <Chip nowrap>{fmtLevel(dataObj().level, dataObj().meta?.ritual)}</Chip>
      <Chip mono>
        {schoolAbbreviationMap.get(dataObj().school)!.slice(0, 5)}
      </Chip>
      <Chip>{fmtRange(dataObj().range)}</Chip>
      <Chip nowrap>
        {dataObj().duration[0].concentration !== undefined ? "x" : ""}
      </Chip>
      <Chip final nowrap>
        {dataObj().source}
      </Chip>
    </ChipRow>
  );
};
