import type { Component } from "solid-js"

import styles from "./Renderer.module.scss"

type DataNode = { [key: string]: Data }
type DataGroup = DataNode[]
type Data = string | DataNode | DataGroup

const StringRenderer: Component<{string: string}> = props => {
  return <p>{"string: "}{props.string}</p>
}

const GroupRenderer: Component<{group: DataGroup}> = props => {
  return <p>{"group: "}{props.group.toString()}</p>
}

const Renderer: Component<{data: string}> = (props) => {

  const dataObj: Data = JSON.parse(props.data)

  if(typeof dataObj === "string") {
    return <StringRenderer string={dataObj} />
  }

  console.log(dataObj)

  Object.entries(dataObj).forEach(([key, data]) => {
    console.log(key, "::", data)
  })
  
  return <p class={styles.Renderer}>{props.data}</p>
}
export default Renderer