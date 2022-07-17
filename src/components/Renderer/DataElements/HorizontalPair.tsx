import { Component, JSX } from "solid-js";

import styles from "./DataElement.module.scss";

const HorizontalPair: Component<{
  children: JSX.Element;
}> = (props) => <div class={styles.HorizontalPair}>{props.children}</div>;
export default HorizontalPair;
