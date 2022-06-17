import { Component, For } from "solid-js"

import styles from "./Renderer.module.scss"

type DataNode = { [key: string]: Data }
type DataGroup = DataNode[]
type Data = string | DataNode | DataGroup

const SectionType: Component<{name: string, entries: DataGroup}> = props => {
  return <><h1>{props.name}</h1><DataGroupRenderer group={props.entries}/></>
}

const entryTypes = new Map<string, typeof SectionType>(Object.entries({
  "section": SectionType
}))

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


  if(props.data.type && entryTypes.has(props.data.type as string)) {
    const Entry = entryTypes.get(props.data.type as string)
    return <SectionType {...props.data as { name: string, entries: DataGroup}}/>
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