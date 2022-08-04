import { Component, JSX } from "solid-js";

import styles from "./Crunch.module.scss";

export const Crunch: Component<{
  children: JSX.Element;
}> = (props) => <span class={styles.Crunch}>{props.children}</span>;

export default Crunch;
