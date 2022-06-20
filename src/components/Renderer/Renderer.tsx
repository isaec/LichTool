import {
  children,
  Component,
  createMemo,
  ErrorBoundary,
  FlowComponent,
  For,
  JSX,
  JSXElement,
  Match,
  mergeProps,
  Show,
  Switch,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import parseData from "./parseData";

import styles from "./Renderer.module.scss";
import {
  Data,
  DataGroup,
  DataNode,
  InsetData,
  isDataNode,
  ListData,
  listStyles,
  QuoteData,
  SectionData,
} from "./types";

const RenderError: Component<{
  error: string;
  details?: string;
  noErrorLabel?: boolean;
  noColon?: boolean;
  clickable?: {
    label: string;
    onClick: () => unknown;
  };
}> = (props) => (
  <span class={styles.error}>
    {`${props.error}${!props.noErrorLabel ? " ERROR" : ""}${
      props.noColon === true ? "" : ": "
    }`}
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
    list: (props: { data: ListData }) => {
      const classes = createMemo(() => {
        // if there is no style, we don't need to give it a class
        if (props.data.style === undefined) return "";
        // if there is only one style, give it the appropriate class
        if (listStyles.has(props.data.style)) return styles[props.data.style];

        // otherwise, build up a string of each converted style
        const classStack: Array<string> = [];
        listStyles.forEach((style) => {
          if (props.data.style!.includes(style)) classStack.push(styles[style]);
        });
        return classStack.join(" ");
      });
      return (
        <>
          <Show when={props.data.name !== undefined}>
            <b>{props.data.name}</b>
          </Show>
          <ul
            classList={{
              [styles.list]: true,
              [styles.column]: typeof props.data.columns === "number",
              [classes()]: true,
            }}
            style={
              typeof props.data.columns === "number"
                ? {
                    "column-count": props.data.columns,
                  }
                : undefined
            }
          >
            <For each={props.data.items}>
              {(item) => (
                <ListItem condition={isDataNode(item) && item.type === "list"}>
                  <DataRenderer data={item} />
                </ListItem>
              )}
            </For>
          </ul>
        </>
      );
    },
    inset: (props: { data: InsetData }) => (
      <div class={styles.inset}>
        <h4>{props.data.name}</h4>
        {<DataRenderer data={props.data.entries} />}
      </div>
    ),
    quote: (props: { data: QuoteData }) => {
      const entries = createMemo(() => {
        // if we only have one string, quote it
        if (
          props.data.entries.length === 1 &&
          typeof props.data.entries[0] === "string"
        ) {
          return [`"${props.data.entries}"`];
        }

        // we have many things, but some elements may be strings
        const arr = props.data.entries.slice(1, -1);

        if (typeof props.data.entries[0] === "string") {
          arr.unshift(`"${props.data.entries[0]}`);
        } else {
          arr.unshift(`"`);
          arr.unshift(props.data.entries[0]); // also add the missing non string element
        }

        if (
          typeof props.data.entries[props.data.entries.length - 1] === "string"
        ) {
          arr.push(`${props.data.entries[props.data.entries.length - 1]}"`);
        } else {
          arr.push(props.data.entries[props.data.entries.length - 1]); // add the missing non string element
          arr.push(`"`);
        }

        return arr;
      });
      return (
        <figure>
          <DataGroupRenderer group={entries()} wrapper={"blockquote"} />
          <Show when={typeof (props.data.by ?? props.data.from) !== undefined}>
            <figcaption>
              — {props.data.by}
              <Show
                when={
                  typeof props.data.by === "string" &&
                  typeof props.data.from === "string"
                }
              >
                ,{" "}
              </Show>
              <cite>{props.data.from}</cite>
            </figcaption>
          </Show>
        </figure>
      );
    },
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

const tag =
  (
    tagString: keyof JSX.IntrinsicElements,
    obj?: {
      class?: string;
      style?: string;
    }
  ): Component<{ children: JSX.Element }> =>
  (props) =>
    (
      <Dynamic
        component={tagString}
        children={props.children}
        class={obj?.class}
        style={obj?.style}
      />
    );

const tagMap = new Map<string, Component<{ children: JSX.Element }>>(
  Object.entries({
    // intrinsic tags
    bold: tag("b"),
    italic: tag("i"),
    strike: tag("s"),
    code: tag("code"),
    // styled intrinsic tags
    underline: tag("span", { class: styles.underline }),
    note: tag("i", { class: styles.note }),
    // complex tags
    color: pipe((props) => (
      <span style={`color: #${props.p1}`}>{props.p0}</span>
    )),
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
const isNestedTag = /{@[^}]*?{@.*?}[^{]*?}/;
const unclosedTag = /{@[^}]*$/m;
const unclosedTagGroup = /(.*?)({@\w*)([^}]*)$/m;
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
  // this is a safe assumption because this function is only called if there are nested tags
  let braces = 1;
  let index = string.indexOf("{@");
  const rawPrefixIndex = index;
  while (braces !== 0) {
    let nextOpeningIndex = string.indexOf("{@", index + 1);
    let nextClosingIndex = string.indexOf("}", index) + 1;
    if (nextOpeningIndex !== -1 && nextOpeningIndex < nextClosingIndex) {
      // if a new brace is opened before our group closes
      braces++; // we are going a brace deeper
      index = nextOpeningIndex;
    } else {
      // if brace is closed before another is opened
      braces--;
      index = nextClosingIndex;
    }
  }
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
  components.push(rawPrefix);

  if (contents.includes("{@")) {
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
  }
  if (rawSuffix.includes("{@")) {
    recursiveTagMatcher(components, rawSuffix);
  } else {
    components.push(rawSuffix);
  }
};

// readonly to make sure string is not mutated
const DataStringRenderer: Component<Readonly<{ string: string }>> = (props) => {
  const memoizedComponents = createMemo(() => {
    const components: JSXElement[] = [];

    if (isNestedTag.test(props.string)) {
      try {
        if (unclosedTag.test(props.string)) {
          const [, prefix, unclosed, suffix] =
            props.string.match(unclosedTagGroup)!;
          return (
            <p>
              {prefix}
              <RenderError
                noErrorLabel
                noColon
                error={unclosed}
                details={" <= unclosed tag"}
              />
              {suffix}
              <br />
              <RenderError
                error={"unclosed tag"}
                details={`this string contains nested tags, with an unclosed brace. It cannot safely be parsed. Try adding a "}" to the end?`}
              />
            </p>
          );
        }
        recursiveTagMatcher(components, props.string);
      } catch (e) {
        return (
          <RenderError
            error={(e as Error).name}
            details={`${(e as Error).message} was thrown on "${
              props.string
            }" by recursiveTagMatcher`}
          />
        );
      }
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

    return components;
  });

  return <p>{memoizedComponents()}</p>;
};

const DataGroupRenderer: Component<{
  group: DataGroup;
  wrapper?: keyof JSX.IntrinsicElements | FlowComponent;
}> = (props) => {
  const merged = mergeProps({ wrapper: "p" }, props);

  return (
    <Dynamic
      component={merged.wrapper}
      children={
        <For each={props.group}>{(data) => <DataRenderer data={data} />}</For>
      }
    />
  );
};

const DataNodeRenderer: Component<{ data: DataNode }> = (props) => {
  const Entry = createMemo(() => entryTypes.get(props.data.type));

  return (
    <Show
      when={Entry() !== undefined}
      fallback={
        <RenderError
          error={`UNKNOWN type=${props.data.type}`}
          details={JSON.stringify(props.data)}
        />
      }
    >
      <Dynamic component={Entry() as any} data={props.data} />
    </Show>
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

const Renderer: Component<{ data: string | object }> = (props) => {
  const data = createMemo((): Data => {
    try {
      return parseData(props.data);
    } catch (e) {
      return {
        type: "section",
        name: "Error!",
        entries: [
          "The json that Renderer was passed cannot be rendered, because it is not valid json.",
          "The full error has been serialized below for your convenience.",
          (e as Error).toString(),
        ],
      };
    }
  });
  return (
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
        <DataRenderer data={data()} />
      </ErrorBoundary>
    </p>
  );
};

export default Renderer;
