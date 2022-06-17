import { Component, createSignal } from 'solid-js';
// @ts-ignore
import renderdemo from "./data/renderdemo.json"

import styles from './App.module.scss';
import Renderer from './components/Renderer';

console.log(renderdemo)

const App: Component = () => {

  const [data, setData] = createSignal("{}")

  return (
    <div class={styles.App}>
      <Renderer data={data()}/>
    </div>
  );
};

export default App;
