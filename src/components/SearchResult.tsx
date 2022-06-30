import { spellMap } from "@src/dataLookup";
import { Accessor, Component, createMemo } from "solid-js";
import { schoolAbbreviationMap } from "./generalTypes";
import { DataSpell } from "./Renderer/types";

import styles from "./SearchResult.module.scss";

export const SearchResult: Component<{ id: string }> = (props) => {
  const dataObj = createMemo(() =>
    spellMap.get(props.id)
  ) as Accessor<DataSpell>;
  return (
    <>
      <p class={styles.primaryChip}>{dataObj().name}</p>
      <p class={styles.chip}>{`lvl ${dataObj().level}`}</p>
      <p class={styles.finalChip}>
        {schoolAbbreviationMap.get(dataObj().school)}
      </p>
    </>
  );
};
export const searchResultFn = (result: { id: string }) => (
  <SearchResult id={result.id} />
);
