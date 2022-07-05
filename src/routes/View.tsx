import DataSpellElement from "@components/Renderer/DataSpellElement";
import { DataSpell } from "@src/components/Renderer/types";
import { spellMap } from "@src/dataLookup";
import { useParams } from "solid-app-router";

const firstSpell: DataSpell = spellMap.entries().next().value[1];

const View = () => {
  const params = useParams();

  return <DataSpellElement data={spellMap.get(params.id) ?? firstSpell} />;
};

export default View;
