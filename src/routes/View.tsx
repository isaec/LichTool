import { DataSpellElement, DataGenericElement } from "@components/Renderer";
import DataItemElement from "@src/components/Renderer/DataElements/DataItemElement";
import {
  dataArray,
  DataItem,
  dataMap,
  DataSpell,
  DataUnion,
  isDataItem,
  isDataSpell,
} from "@src/dataLookup";
import { useParams } from "solid-app-router";
import { createMemo, Match, Switch } from "solid-js";

const firstData: DataUnion = dataArray[0];

const View = () => {
  const params = useParams();

  const data = createMemo(() => dataMap.get(params.id) ?? firstData);

  return (
    <Switch fallback={<DataGenericElement data={data()} />}>
      <Match when={isDataSpell(data())}>
        <DataSpellElement data={data() as DataSpell} />
      </Match>
      <Match when={isDataItem(data())}>
        <DataItemElement data={data() as DataItem} />
      </Match>
    </Switch>
  );
};

export default View;
