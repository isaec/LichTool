import { Component, createSignal } from 'solid-js';

import styles from './App.module.scss';
import Renderer from './components/Renderer';

const App: Component = () => {

  const [data, setData] = createSignal("{}")

  return (
    <div class={styles.App}>
      <Renderer data={data()}/>
    </div>
  );
};

export default App;
