import { Component, createSignal } from "solid-js";
import renderdemo from "@data/renderdemo.json";

import styles from "./RenderDemo.module.scss";
import { Renderer } from "@components";

const RenderDemo: Component = () => {
  const [data, setData] = createSignal(
    JSON.stringify(renderdemo.data[0], undefined, 2)
  );

  return (
    <div class={styles.RenderDemo}>
      <textarea
        value={data()}
        onInput={(event) => {
          console.log("input!");
          // @ts-expect-error
          setData(event.target.value);
        }}
      ></textarea>
      <Renderer data={data()} />
    </div>
  );
};

export default RenderDemo;
