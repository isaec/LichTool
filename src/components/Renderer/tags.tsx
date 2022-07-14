import { fmtDataUrl } from "@src/formatter";
import { Link } from "solid-app-router";
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
  (Element: Component<{ p: string[]; p0: string; p1?: string; p2?: string }>) =>
  (props: { children: JSX.Element }): JSX.Element => {
    const pipeSplit =
      typeof props.children === "string" ? props.children.split("|") : [""];
    return (
      <Element
        p={pipeSplit}
        p0={pipeSplit[0]}
        p1={pipeSplit[1]}
        p2={pipeSplit[2]}
      />
    );
  };

const refTag = (type: string, defaultSource: string) =>
  pipe((props) => (
    <Link
      href={`/view/${fmtDataUrl(
        type,
        props.p0,
        props.p1 === undefined || props.p1 === "" ? defaultSource : props.p1
      )}`}
    >
      {props.p2 ?? props.p0}
    </Link>
  ));

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

const templateTag =
  (
    tagString: keyof JSX.IntrinsicElements,
    templater: (arg0: JSX.Element) => JSX.Element,
    obj?: {
      class?: string;
      style?: string;
    }
  ): Component<{ children: JSX.Element }> =>
  (props) =>
    (
      <Dynamic
        component={tagString}
        children={templater(props.children)}
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
    // link tags
    spell: refTag("spell", "phb"),
    condition: refTag("condition", "phb"),
    action: refTag("action", "phb"),
    // bad / unsupported tags
    filter: pipe((props) => props.p0),
    dice: tag("code"),
    hit: templateTag("code", (c) => <>d20{c}</>),
    damage: tag("code"),
    d20: templateTag("code", (c) => <>d20{c}</>),
    scaledice: pipe((props) => <code>{props.p2}</code>),
    scaledamage: pipe((props) => <code>{props.p2}</code>),
  })
);
