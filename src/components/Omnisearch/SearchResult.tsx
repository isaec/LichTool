import { dataMap, DataSpell } from "@src/dataLookup";
import {
  Accessor,
  Component,
  createMemo,
  For,
  JSX,
  Match,
  Switch,
} from "solid-js";
import { schoolAbbreviationMap } from "@components/generalTypes";
import { extractTypeFromUrl, fmtRange } from "@src/formatter";

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

// implementations

const SpellHeader: Component = () => (
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

const SpellSearchResult: Component<{ id: string }> = (props) => {
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

const GenericHeader: Component<{ type: string }> = (props) => (
  <Head>
    <Col>{props.type} name</Col>
    <Col>page</Col>
    <Col>source</Col>
  </Head>
);

const GenericSearchResult: Component<{ id: string }> = (props) => {
  const dataObj = createMemo(() => dataMap.get(props.id)!);
  return (
    <TableRow id={props.id}>
      <Key>{dataObj().name}</Key>
      <Data>p{dataObj().page}</Data>
      <Data>{dataObj().source}</Data>
    </TableRow>
  );
};

const headMap = new Map([["spell", SpellHeader]]);

export const SearchResult: Component<{ id: string }> = (props) => {
  const dataType = createMemo(() => extractTypeFromUrl(props.id));
  return (
    <Switch fallback={<GenericSearchResult id={props.id} />}>
      <Match when={dataType() === "spell"}>
        <SpellSearchResult id={props.id} />
      </Match>
    </Switch>
  );
};

export const Results: Component<{ results: ResultsGroup[] }> = (props) => (
  <div class={styles.resultsWrapper}>
    <For each={props.results}>
      {(resultGroup) => (
        <table class={styles.results}>
          <Dynamic
            component={headMap.get(resultGroup.type) ?? GenericHeader}
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
