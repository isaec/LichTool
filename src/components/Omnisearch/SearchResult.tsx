import { DataItem, dataMap, DataSpell } from "@src/dataLookup";
import {
  Accessor,
  Component,
  createMemo,
  For,
  JSX,
  Match,
  Switch,
} from "solid-js";
import { extractTypeFromUrl, fmtCurrency, fmtRange } from "@util/formatter";

import styles from "./SearchResult.module.scss";
import { useNavigate } from "solid-app-router";
import { ResultsGroup } from "./groupResults";
import { Dynamic } from "solid-js/web";

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

const Head: Component<{ children: JSX.Element }> = (props) => (
  <thead class={styles.Head}>{props.children}</thead>
);

const Col: Component<{
  children: JSX.Element;
  optional?: boolean;
}> = (props) => (
  <th
    scope="col"
    classList={{
      [styles.optional]: props.optional,
    }}
  >
    {props.children}
  </th>
);

type HeadComponent = Component<{}>;
type GenericHeadComponent = Component<{
  type: string;
}>;
type ResultComponent = Component<{
  id: string;
}>;

// implementations

const headMap = new Map<string, HeadComponent | GenericHeadComponent>();
const resultMap = new Map<string, ResultComponent>();

const SpellHeader: HeadComponent = () => (
  <Head>
    <Col>spell name</Col>
    <Col>level</Col>
    <Col>school</Col>
    <Col>range</Col>
    <Col optional>con</Col>
    <Col optional>rit</Col>
    <Col>source</Col>
  </Head>
);
headMap.set("spell", SpellHeader);

const SpellSearchResult: ResultComponent = (props) => {
  const dataObj = createMemo(
    () => dataMap.get(props.id)!
  ) as Accessor<DataSpell>;
  return (
    <TableRow id={props.id}>
      <Key>{dataObj().name}</Key>
      <Data mono nowrap>
        {dataObj().level}
      </Data>
      <Data mono nowrap>
        {dataObj().school.slice(0, 5)}
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
resultMap.set("spell", SpellSearchResult);

const ItemHeader: HeadComponent = () => (
  <Head>
    <Col>item name</Col>
    <Col>type</Col>
    <Col>value</Col>
    <Col>rarity</Col>
    <Col>source</Col>
  </Head>
);
headMap.set("item", ItemHeader);

const ItemSearchResult: ResultComponent = (props) => {
  const dataObj = createMemo(
    () => dataMap.get(props.id)!
  ) as Accessor<DataItem>;
  return (
    <TableRow id={props.id}>
      <Key>{dataObj().name}</Key>
      <Data>{dataObj().type ?? ""}</Data>
      <Data>
        {typeof dataObj().value === "number"
          ? fmtCurrency(dataObj().value as number)
          : "-"}
      </Data>
      <Data>{dataObj().rarity}</Data>
      <Data>{dataObj().source}</Data>
    </TableRow>
  );
};
resultMap.set("item", ItemSearchResult);

const GenericHeader: GenericHeadComponent = (props) => (
  <Head>
    <Col>{props.type} name</Col>
    <Col>page</Col>
    <Col>source</Col>
  </Head>
);
headMap.set("generic", GenericHeader);

const GenericSearchResult: ResultComponent = (props) => {
  const dataObj = createMemo(() => dataMap.get(props.id)!);
  return (
    <TableRow id={props.id}>
      <Key>{dataObj().name}</Key>
      <Data>p{dataObj().page}</Data>
      <Data>{dataObj().source}</Data>
    </TableRow>
  );
};
resultMap.set("generic", GenericSearchResult);

const getComponentFromMap =
  <T,>(map: Map<string, T>) =>
  (type: string): T =>
    map.get(type) ?? map.get("generic")!;

export const getHead = getComponentFromMap(headMap);
export const getResult = getComponentFromMap(resultMap);

export const SearchResult: Component<{ id: string }> = (props) => {
  const resultComponent = createMemo(() =>
    getResult(extractTypeFromUrl(props.id))
  );
  return <Dynamic component={resultComponent()} id={props.id} />;
};

export const Results: Component<{ results: ResultsGroup[] }> = (props) => (
  <div class={styles.resultsWrapper}>
    <For each={props.results}>
      {(resultGroup) => (
        <table class={styles.results}>
          <Dynamic
            component={getHead(resultGroup.type)}
            type={resultGroup.type}
          />
          <For each={resultGroup.results}>
            {(result) => <SearchResult id={result.id} />}
          </For>
        </table>
      )}
    </For>
  </div>
);
