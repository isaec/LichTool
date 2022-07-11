import DataSpellElement from "@components/Renderer/DataSpellElement";
import DataGenericElement from "@components/Renderer/DataGenericElement";
import {
  dataArray,
  dataMap,
  DataSpell,
  DataUnion,
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
    </Switch>
  );
};

export default View;
