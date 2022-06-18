import {
  children,
  Component,
  ErrorBoundary,
  For,
  JSX,
  JSXElement,
  Match,
  Switch,
} from "solid-js";

import styles from "./Renderer.module.scss";

type SectionData = { type: "section"; name: string; entries: DataGroup };
type ListData = { type: "list"; items: Data[] };
type InsetData = { type: "inset"; name: string; entries: Data };

type DataNode = SectionData | ListData | InsetData;
const isDataNode = (data: Data | object): data is DataNode =>
  typeof (data as DataNode).type === "string";
type DataGroup = DataNode[];
type Data = string | DataNode | DataGroup;

const RenderError: Component<{
  error: string;
  details?: string;
  noErrorLabel?: boolean;
  clickable?: {
    label: string;
    onClick: () => unknown;
  };
}> = (props) => (
  <span class={styles.error}>
    {`${props.error}${!props.noErrorLabel ? " ERROR" : ""}: `}
    <code>{props.details ?? "no details provided"}</code>
    {props.clickable === undefined ? undefined : (
      <>
        {". "}
        <a
          onClick={(e) => {
            e.preventDefault();
            props.clickable?.onClick();
          }}
          href="#"
        >
          {props.clickable.label}
        </a>
      </>
    )}
  </span>
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
      <span style={`color: #${props.p1}`}>{props.p0}</span>
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

/** cannot match nested tags */
const tagMatcher = /(?<!$)(.*?)(?:{@(\w*)\s(.*?)}|$)/gm;
type matchedTag = [string, string?, string?, (string | JSXElement)?];
const isNestedTag = /{[^}]*?{.*?}.*?}/gm;
const firstWord = /\w+/;

const processTag = (elementStack: JSXElement[], matchValue: matchedTag) => {
  const [, rawPrefix, tag, contents] = matchValue;
  if (rawPrefix !== undefined) elementStack.push(cleanText(rawPrefix));
  if (tag !== undefined && contents !== undefined) {
    const aliasTag = tagAlias.get(tag);
    const TagComponent = tagMap.get(aliasTag !== undefined ? aliasTag : tag);
    if (TagComponent !== undefined) {
      elementStack.push(
        <TagComponent>
          {typeof contents === "string" ? cleanText(contents) : contents}
        </TagComponent>
      );
    } else {
      elementStack.push(
        <RenderError
          error={`UNKNOWN tag="${tag}"`}
          details={`{@${tag} ${contents}}`}
        />
      );
    }
  }
};

const recursiveTagMatcher = (
  components: JSXElement[],
  string: Readonly<string>
) => {
  // console.log("tag matcher:\n", string);
  // this is a safe assumption because this function is only called if there are nested tags
  let braces = 1;
  let index = string.indexOf("{@");
  const rawPrefixIndex = index;
  while (braces !== 0) {
    // console.log({ braces, index, slice: string.slice(index) });
    let nextOpeningIndex = string.indexOf("{@", index + 1);
    let nextClosingIndex = string.indexOf("}", index) + 1;
    if (nextOpeningIndex !== -1 && nextOpeningIndex < nextClosingIndex) {
      // if a new brace is opened before our group closes
      braces++; // we are going a brace deeper
      // console.log("shift right:", nextOpeningIndex - index);
      index = nextOpeningIndex;
    } else {
      // if brace is closed before another is opened
      // console.log("shift right:", nextClosingIndex - index);
      braces--;
      index = nextClosingIndex;
    }
  }
  // console.log("walked!", { braces, index, slice: string.slice(index) });
  const rawSuffixIndex = index;

  const rawPrefix = string.slice(0, rawPrefixIndex);
  const rawSuffix = string.slice(rawSuffixIndex);

  const braceFullContents = string.slice(
    rawPrefixIndex + 2,
    rawSuffixIndex - 1
  );

  // this might crash
  const tag = braceFullContents.match(firstWord)![0];
  const contents = braceFullContents.slice(tag.length + 1);
  // console.log({ rawPrefix, tag, contents, rawSuffix });
  components.push(rawPrefix);

  if (contents.includes("{@")) {
    // console.log(
    //   "%cbranch on contents",
    //   "color: limegreen; font-weight: bold; font-size: 1.5rem;"
    // );

    // process the tags deeper then this brace
    const elementStack: JSXElement[] = [];
    recursiveTagMatcher(elementStack, contents);

    // put the content of those nested tags inside the tag for our brace
    processTag(components, [
      string,
      undefined /* we already pushed this */,
      tag,
      elementStack,
    ]);
  } else {
    processTag(components, [
      string,
      undefined /* we already pushed this */,
      tag,
      contents,
    ]);
    // components.push(elementStack[0]);
  }
  if (rawSuffix.includes("{@")) {
    // console.log(
    //   "%cbranch on suffix",
    //   "color: rebeccapurple; font-weight: bold; font-size: 1.5rem;"
    // );
    recursiveTagMatcher(components, rawSuffix);
  } else {
    components.push(rawSuffix);
  }
};

// readonly to make sure string is not mutated
const DataStringRenderer: Component<Readonly<{ string: string }>> = (props) => {
  const components: JSXElement[] = [];

  if (isNestedTag.test(props.string)) {
    recursiveTagMatcher(components, props.string);
    // console.log("%cdone", "color: red; font-weight: bold; font-size: 1.5rem;");
    // components.forEach((e) => console.log(e));
  } else {
    // non nested regex based parsing
    const parseIterator = props.string.matchAll(
      tagMatcher
    ) as IterableIterator<matchedTag>;

    let match = parseIterator.next();
    while (!match.done) {
      processTag(components, match.value);
      match = parseIterator.next();
    }
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

const DataRenderer: Component<{ data: Data }> = (props) => (
  <Switch fallback={<DataNodeRenderer data={props.data as DataNode} />}>
    <Match when={typeof props.data === "string"}>
      <DataStringRenderer
        string={
          props.data as string /* ts cant understand switch is a type guard */
        }
      />
    </Match>
    <Match when={Array.isArray(props.data)}>
      <DataGroupRenderer group={props.data as DataGroup} />
    </Match>
  </Switch>
);

/** internal data parser, handling data in many format types */
export const _parseData = (data: object | string): Data => {
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch (e) {
      // this will test if its a string unquoted, or actually failing validation
      return JSON.parse(`"${data}"`);
    }
  }
  if (isDataNode(data)) {
    return data;
  }

  throw new Error("incomprehensible data - not a string or legal object");
};

const Renderer: Component<{ data: string | object }> = (props) => (
  <p class={styles.Renderer}>
    <ErrorBoundary
      fallback={(err, reset) => (
        <RenderError
          error={`renderer caught an uncaught Data ${err.name}`}
          details={err.message}
          clickable={{
            label: "rebuild Data tree",
            onClick: reset,
          }}
          noErrorLabel
        />
      )}
    >
      <DataRenderer data={_parseData(props.data)} />
    </ErrorBoundary>
  </p>
);

export default Renderer;
