import { Component, For } from "solid-js";
import { DataSpell } from "./types";

import styles from "./DataSpellElement.module.scss";

const DataSpellElement: Component<{
  data: DataSpell;
}> = (props) => {
  return (
    <div class={styles.DataSpellElement}>
      <For each={Object.entries(props.data)}>
        {([key, value]: [string, any]) => (
          <p>
            {key}: {JSON.stringify(value)}
          </p>
        )}
      </For>
    </div>
  );
};

export default DataSpellElement;
