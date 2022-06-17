import { Component, For } from "solid-js"

import styles from "./Renderer.module.scss"

type DataNode = { [key: string]: Data }
type DataGroup = DataNode[]
type Data = string | DataNode | DataGroup

const DataStringRenderer: Component<{string: string}> = props => {
  console.log("string renderer >>", props.string)
  return <p class={styles.string} >{"string: "}{props.string}</p>
}

const DataGroupRenderer: Component<{group: DataGroup}> = props => {
  console.log("group renderer >>", props.group)
  return <p>{"group: "}<For each={props.group}>{(data) => <DataRenderer data={data}/>}</For></p>
}

const DataNodeRenderer: Component<{data: DataNode}> = props => {
  console.log("node renderer >>", props.data)


  // Object.entries(props.data).forEach(([key, data]) => {
  //   console.log(key, "::", data)
  // })

  if(props.data.entries !== undefined) {
    const {entries, ...dispData} = props.data
    return <p>{"data: "}{JSON.stringify(dispData)}{" :: group:"}<DataGroupRenderer group={entries as DataGroup}/></p>
  }

  if(props.data.items !== undefined) {
    const {items, ...dispData} = props.data
    return <p>{"data: "}{JSON.stringify(dispData)}{" :: group:"}<DataGroupRenderer group={items as DataGroup}/></p>
  }

  return <p>{"data: "}{JSON.stringify(props.data)}</p>
}

const DataRenderer: Component<{data: Data}> = props => {

  if(typeof props.data === "string") {
    return <DataStringRenderer string={props.data} />
  }

  if(Array.isArray(props.data)) {
    return <DataGroupRenderer group={props.data} />
  }
  
  return <DataNodeRenderer data={props.data} />
}

const Renderer: Component<{data: string}> = (props) => {

  const dataObj: Data = JSON.parse(props.data)

  return <DataRenderer data={dataObj} />
}
export default Renderer