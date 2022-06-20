import { Component } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { Dynamic } from "solid-js/web";

import styles from "./Renderer.module.scss";

/**
 * maps alias shorthand "b" to full tag "bold"
 */
export const tagAlias = new Map([
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

export const tagMap = new Map<string, Component<{ children: JSX.Element }>>(
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
