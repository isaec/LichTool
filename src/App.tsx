import { Component, createSignal } from "solid-js";
// @ts-ignore
import renderdemo from "./data/renderdemo.json";

import styles from "./App.module.scss";
import Renderer from "./components/Renderer";

const App: Component = () => {
  const [data, setData] = createSignal(
    "some text: {@b bolded {@i and italic} and now just bold - now {@s struck bold!}, bold}, more text"
  );

  return (
    <div class={styles.App}>
      <Renderer data={data()} />
    </div>
  );
};

export default App;
