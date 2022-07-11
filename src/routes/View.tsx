import DataSpellElement from "@components/Renderer/DataSpellElement";
import { DataSpell } from "@src/components/Renderer/types";
import { dataArray, dataMap } from "@src/dataLookup";
import { useParams } from "solid-app-router";

const firstData: DataSpell = dataArray[0];

const View = () => {
  const params = useParams();

  return <DataSpellElement data={dataMap.get(params.id) ?? firstData} />;
};

export default View;
