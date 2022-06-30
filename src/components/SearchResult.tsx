import { spellMap } from "@src/dataLookup";
import { Accessor, Component, createMemo } from "solid-js";
import { schoolAbbreviationMap } from "./generalTypes";
import { DataSpell } from "./Renderer/types";

import styles from "./SearchResult.module.scss";

const Chip: Component<{
  children: string;
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

export const SearchResult: Component<{ id: string }> = (props) => {
  const dataObj = createMemo(() =>
    spellMap.get(props.id)
  ) as Accessor<DataSpell>;
  return (
    <>
      <Chip primary>{dataObj().name}</Chip>
      <Chip>
        {dataObj().level === 0 ? "Cantrip" : `lvl ${dataObj().level}`}
      </Chip>
      <Chip>{schoolAbbreviationMap.get(dataObj().school)!}</Chip>
      <Chip final>{dataObj().source}</Chip>
    </>
  );
};
export const searchResultFn = (result: { id: string }) => (
  <SearchResult id={result.id} />
);
