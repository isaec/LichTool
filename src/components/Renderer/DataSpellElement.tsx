import { Component, For } from "solid-js";
import { DataSpell } from "./types";

import styles from "./DataSpellElement.module.scss";

const DataSpellElement: Component<{
  data: DataSpell;
}> = (props) => {
  return (
    <div class={styles.DataSpellElement}>
      <i>
        {props.data.level} level {props.data.school}
      </i>
      <p>
        <b>Casting time: </b>
        {props.data.time[0].number} {props.data.time[0].unit}
      </p>
      <p>
        <b>Range: </b>
        {props.data.range.type} {props.data.range.distance.amount}{" "}
        {props.data.range.distance.type}
      </p>
      <p>
        <b>Components: </b>
        {JSON.stringify(props.data.components)}
      </p>
      <p>
        <b>Duration: </b>
        {props.data.duration[0].type}
      </p>
    </div>
  );
};

export default DataSpellElement;
