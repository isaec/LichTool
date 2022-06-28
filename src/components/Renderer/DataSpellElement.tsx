import { Component } from "solid-js";
import { DataSpell } from "./types";

const DataSpellElement: Component<{
  data: DataSpell;
}> = (props) => {
  return <p>{JSON.stringify(props.data, undefined, 2)}</p>;
};

export default DataSpellElement;
