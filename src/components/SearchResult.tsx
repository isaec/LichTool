import { spellMap } from "@src/dataLookup";
import { Accessor, Component, createMemo, JSX, Show } from "solid-js";
import { schoolAbbreviationMap } from "./generalTypes";
import { DataSpell } from "./Renderer/types";
import { fmtRange } from "@src/formatter";

import styles from "./SearchResult.module.scss";
import { Navigate, useNavigate } from "solid-app-router";

const Chip: Component<{
  children: JSX.Element;
  final?: boolean;
  primary?: boolean;
}> = (props) => (
  <p
    classList={{
      [styles.chip]: true,
      [styles.primary]: props.primary,
      [styles.final]: props.final,
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

export const SearchResult: Component<{ id: string }> = (props) => {
  const dataObj = createMemo(() =>
    spellMap.get(props.id)
  ) as Accessor<DataSpell>;
  return (
    <ChipRow id={props.id}>
      <Chip primary>{dataObj().name}</Chip>
      <Chip>
        {dataObj().level === 0 ? "Cantrip" : `lvl ${dataObj().level}`}
      </Chip>
      <Chip>{schoolAbbreviationMap.get(dataObj().school)!}</Chip>
      <Chip>{fmtRange(dataObj().range)}</Chip>
      <Show when={dataObj().duration[0].concentration !== undefined}>
        <Chip>
          <small>Concentration</small>
        </Chip>
      </Show>
      <Chip final>{dataObj().source}</Chip>
    </ChipRow>
  );
};
export const searchResultFn = (result: { id: string }) => (
  <SearchResult id={result.id} />
);
