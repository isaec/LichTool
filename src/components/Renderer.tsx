import { Component, For } from "solid-js";

import styles from "./Renderer.module.scss";

type DataNode = { [key: string]: Data };
type DataGroup = DataNode[];
type Data = string | DataNode | DataGroup;

type DataNodeType = Component<{ data: DataNode }>;

const entryTypes = new Map<string, DataNodeType>(
  Object.entries({
    // each key corresponds to a "type": "xxx"
    // each value is jsx to render that type
    section: (props) => (
      <>
        <h1>{props.data.name as string}</h1>
        <DataGroupRenderer group={props.data.entries as DataGroup} />
      </>
    ),
    list: (props) => (
      <ul>
        <For each={props.data.items as Data[]}>
          {(item) => <li>{<DataRenderer data={item} />}</li>}
        </For>
      </ul>
    ),
    inset: (props) => (
      <div class={styles.inset}>
        <h1>{props.data.name as string}</h1>
        {<DataRenderer data={props.data.entries} />}
      </div>
    ),
  })
);

const DataStringRenderer: Component<{ string: string }> = (props) => {
  console.log("string renderer >>", props.string);
  return (
    <p class={styles.string}>
      {"string: "}
      {props.string}
    </p>
  );
};

const DataGroupRenderer: Component<{ group: DataGroup }> = (props) => {
  console.log("group renderer >>", props.group);
  return (
    <p>
      {"group: "}
      <For each={props.group}>{(data) => <DataRenderer data={data} />}</For>
    </p>
  );
};

const DataNodeRenderer: Component<{ data: DataNode }> = (props) => {
  console.log("node renderer >>", props.data);

  const Entry = entryTypes.get(props.data.type as string);

  if (Entry === undefined) {
    return (
      <p class={styles.error}>
        {`"${props.data.type}" data (UNKNOWN TYPE FAILURE): `}
        {JSON.stringify(props.data)}
      </p>
    );
  }

  return <Entry data={props.data} />;
};

const DataRenderer: Component<{ data: Data }> = (props) => {
  if (typeof props.data === "string") {
    return <DataStringRenderer string={props.data} />;
  }

  if (Array.isArray(props.data)) {
    return <DataGroupRenderer group={props.data} />;
  }

  return <DataNodeRenderer data={props.data} />;
};

const Renderer: Component<{ data: string }> = (props) => {
  const dataObj: Data = JSON.parse(props.data);

  return <DataRenderer data={dataObj} />;
};
export default Renderer;
