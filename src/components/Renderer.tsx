import { children, Component, For, JSX, JSXElement } from "solid-js";

import styles from "./Renderer.module.scss";

type SectionData = { type: "section"; name: string; entries: DataGroup };
type ListData = { type: "list"; items: Data[] };
type InsetData = { type: "inset"; name: string; entries: Data };

type DataNode = SectionData | ListData | InsetData;
const isDataNode = (data: Data): data is DataNode =>
  (data as DataNode).type !== undefined;
type DataGroup = DataNode[];
type Data = string | DataNode | DataGroup;

const RenderError: Component<{ error: string; details?: string }> = (props) => (
  <span class={styles.error}>{`${props.error} ERROR: ${
    props.details ?? "no details provided"
  }`}</span>
);

const ListItem: Component<{ condition: boolean; children: JSX.Element }> = (
  props
) => (props.condition ? props.children : <li>{props.children}</li>);

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
          {(item) => (
            <ListItem condition={isDataNode(item) && item.type === "list"}>
              <DataRenderer data={item} />
            </ListItem>
          )}
        </For>
      </ul>
    ),
    inset: (props: { data: InsetData }) => (
      <div class={styles.inset}>
        <h4>{props.data.name}</h4>
        {<DataRenderer data={props.data.entries} />}
      </div>
    ),
  })
);

const cleanText = (text: string) => text.replaceAll("&quot;", '"');

/**
 * maps alias shorthand "b" to full tag "bold"
 */
const tagAlias = new Map([
  ["b", "bold"],
  ["i", "italic"],
  ["u", "underline"],
  ["s", "strike"],
]);

const pipe =
  (Element: Component<{ p: string[]; p0?: string; p1?: string }>) =>
  (props: { children: JSX.Element }): JSX.Element => {
    const pipeSplit =
      typeof props.children === "string" ? props.children.split("|") : [];
    return <Element p={pipeSplit} p0={pipeSplit[0]} p1={pipeSplit[1]} />;
  };

const tagMap = new Map<string, Component<{ children: JSX.Element }>>(
  Object.entries({
    bold: (props) => <b>{props.children}</b>,
    italic: (props) => <i>{props.children}</i>,
    underline: (props) => (
      <span class={styles.underline}>{props.children}</span>
    ),
    strike: (props) => <s>{props.children}</s>,
    color: pipe((props) => (
      <span style={`color: #${props.p0}`}>{props.p1}</span>
    )),
    code: (props) => <code>{props.children}</code>,
    note: (props) => <i class={styles.note}>{props.children}</i>,
    link: pipe((props) => (
      <a href={props.p1 ?? props.p0} target="_blank" rel="noopener noreferrer">
        {props.p0}
      </a>
    )),
    filter: pipe((props) => (
      <a title={props.p?.slice(1).join("|")} href="#">
        {"UNSUPPORTED "}
        {props.p0}
      </a>
    )),
  })
);

const tagMatcher = /(?<!$)(.*?)(?:{@(\w*)\s(.*?)}|$)/gm;
// readonly to make sure string is not mutated
const DataStringRenderer: Component<Readonly<{ string: string }>> = (props) => {
  const parseIterator = props.string.matchAll(tagMatcher) as IterableIterator<
    [string, string?, string?, string?]
  >;
  const components: Array<JSXElement> = [];
  let match = parseIterator.next();
  while (!match.done) {
    const [, rawPrefix, tag, contents] = match.value;
    if (rawPrefix !== undefined) components.push(cleanText(rawPrefix));
    if (tag !== undefined && contents !== undefined) {
      const aliasTag = tagAlias.get(tag);
      const TagComponent = tagMap.get(aliasTag !== undefined ? aliasTag : tag);
      if (TagComponent !== undefined) {
        components.push(<TagComponent>{cleanText(contents)}</TagComponent>);
      } else {
        components.push(
          <RenderError
            error={`UNKNOWN tag="${tag}"`}
            details={`{@${tag} ${contents}}`}
          />
        );
      }
    }

    match = parseIterator.next();
  }

  return <p>{components}</p>;
};

const DataGroupRenderer: Component<{ group: DataGroup }> = (props) => {
  return (
    <p>
      <For each={props.group}>{(data) => <DataRenderer data={data} />}</For>
    </p>
  );
};

const DataNodeRenderer: Component<{ data: DataNode }> = (props) => {
  const Entry = entryTypes.get(props.data.type);

  if (Entry === undefined) {
    return (
      <RenderError
        error={`UNKNOWN type=${props.data.type}`}
        details={JSON.stringify(props.data)}
      />
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

  return (
    <p class={styles.Renderer}>
      <DataRenderer data={dataObj} />
    </p>
  );
};
export default Renderer;
