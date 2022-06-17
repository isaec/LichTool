import { Component, createSignal } from 'solid-js';
// @ts-ignore
import renderdemo from "./data/renderdemo.json"

import styles from './App.module.scss';
import Renderer from './components/Renderer';

const App: Component = () => {

  const [data, setData] = createSignal(JSON.stringify(renderdemo.data[0]))

  return (
    <div class={styles.App}>
      <Renderer data={data()}/>
    </div>
  );
};

export default App;
