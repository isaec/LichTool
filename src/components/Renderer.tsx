import { Component, For, JSX, JSXElement } from "solid-js";

import styles from "./Renderer.module.scss";

type SectionData = { type: "section"; name: string; entries: DataGroup };
type ListData = { type: "list"; items: Data[] };
type InsetData = { type: "inset"; name: string; entries: Data };

type DataNode = SectionData | ListData | InsetData;
type DataGroup = DataNode[];
type Data = string | DataNode | DataGroup;

const entryTypes = new Map(
  Object.entries({
    // each key corresponds to a "type": "xxx"
    // each value is jsx to render that type
    section: (props: { data: SectionData }) => (
      <>
        <h1>{props.data.name}</h1>
        <DataGroupRenderer group={props.data.entries} />
      </>
    ),
    list: (props: { data: ListData }) => (
      <ul>
        <For each={props.data.items}>
          {(item) => <li>{<DataRenderer data={item} />}</li>}
        </For>
      </ul>
    ),
    inset: (props: { data: InsetData }) => (
      <div class={styles.inset}>
        <h1>{props.data.name}</h1>
        {<DataRenderer data={props.data.entries} />}
      </div>
    ),
  })
);
type Tags = "bold";
const Tag: {
  [K in Tags]: Component<{}>;
} = {
  bold: (props) => <b>{"bold"}</b>,
};

const TagMap = new Map(Object.entries(Tag) as Array<[Tags, Component<{}>]>);

const tagMatcher = /(?<!$)(.*?)(?:{@(\w*)\s(.*?)}|$)/gm;
// readonly to make sure string is not mutated
const DataStringRenderer: Component<Readonly<{ string: string }>> = (props) => {
  console.log("string renderer >>", props.string);
  const parseIterator = props.string.matchAll(tagMatcher) as IterableIterator<
    [string, string?, string?, string?]
  >;
  const components: Array<JSXElement> = [];
  let match = parseIterator.next();
  while (!match.done) {
    const [, rawPrefix, tag, contents] = match.value;
    console.log("match >>", `"${rawPrefix}"`, tag, contents);
    if (rawPrefix !== undefined) components.push(rawPrefix);
    if (tag !== undefined && contents !== undefined) {
      const TagComponent = Tag[tag];
      components.push(<TagComponent></TagComponent>);
    }

    match = parseIterator.next();
  }
  // console.log("parse >>>", [...parseIterator]);

  return (
    <p class={styles.string}>
      {"string: "}
      {components}
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

  const Entry = entryTypes.get(props.data.type);

  if (Entry === undefined) {
    return (
      <p class={styles.error}>
        {`"${props.data.type}" data (UNKNOWN TYPE FAILURE): `}
        {JSON.stringify(props.data)}
      </p>
    );
  }

  return (
    <Entry
      data={
        props.data as keyof typeof Entry /* this is safe because we checked the json type - ts just cant tell */
      }
    />
  );
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
