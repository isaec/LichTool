import {
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
import { EntryTypeSelector } from "./entryTypes";
import parseData from "./parseData";
import RenderError from "./RenderError";
import { tagAlias, tagMap } from "./tags";
import { Data, DataGroup, DataNode, EntryLevels } from "./types";

import styles from "./Renderer.module.scss";

const cleanText = (text: string) => text.replaceAll("&quot;", '"');

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
export const DataStringRenderer: Component<Readonly<{ string: string }>> = (
  props
) => {
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

export const DataGroupRenderer: Component<{
  group: DataGroup;
  wrapper?: keyof JSX.IntrinsicElements | Component<{ children: JSX.Element }>;
  entryLevel?: EntryLevels;
}> = (props) => {
  const merged = mergeProps({ wrapper: "p" }, props);

  return (
    <Dynamic
      component={merged.wrapper}
      children={
        <For each={props.group}>
          {(data) => <DataRenderer data={data} entryLevel={props.entryLevel} />}
        </For>
      }
    />
  );
};

export const DataNodeRenderer: Component<{
  data: DataNode;
  entryLevel?: EntryLevels;
}> = (props) => (
  <EntryTypeSelector data={props.data} entryLevel={props.entryLevel} />
);

export const DataRenderer: Component<{
  data: Data;
  entryLevel?: EntryLevels;
}> = (props) => (
  <Switch
    fallback={
      <DataNodeRenderer
        data={props.data as DataNode}
        entryLevel={props.entryLevel}
      />
    }
  >
    <Match when={typeof props.data === "string"}>
      <DataStringRenderer
        string={
          props.data as string /* ts cant understand switch is a type guard */
        }
      />
    </Match>
    <Match when={Array.isArray(props.data)}>
      <DataGroupRenderer
        group={props.data as DataGroup}
        entryLevel={props.entryLevel}
      />
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

/**
 * wrap naked Renderer components in this component to apply styles
 *
 * for example, if you are using DataGroupRenderer, you can wrap it with this component to style its elements
 */
export const RendererStyles: Component<{ children: JSX.Element }> = (props) => (
  <p class={styles.Renderer}>{props.children}</p>
);
