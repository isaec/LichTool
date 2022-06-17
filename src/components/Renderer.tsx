import type { Component } from "solid-js"

import styles from "./Renderer.module.scss"

const Renderer: Component<{data: string}> = (props) => {
  
  return <p class={styles.Renderer}>{props.data}</p>
}
export default Renderer