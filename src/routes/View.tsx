import DataSpellElement from "@components/Renderer/DataSpellElement";
import { dataArray, dataMap, DataUnion } from "@src/dataLookup";
import { useParams } from "solid-app-router";

const firstData: DataUnion = dataArray[0];

const View = () => {
  const params = useParams();

  return <DataSpellElement data={dataMap.get(params.id) ?? firstData} />;
};

export default View;
