import { fmtDataUrl } from "@util/formatter";
import { Link } from "solid-app-router";
import { Component } from "solid-js";
import { JSX } from "solid-js/jsx-runtime";
import { Dynamic } from "solid-js/web";
import Crunch from "./Crunch";

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

/**
 * HOF to reduce boilerplate for splitting a pipe type tag and rendering based on its fragments
 * @param Element the element function which is passed props for the fragments of the piped data
 * @returns A new component which processes the pipe data before passing it to the {@link Element} function, and returns its result
 */
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

/**
 * a HOF to make tags which reference data using url links
 * @param type the type of data to reference - spell, item ect.
 * @param defaultSource the default book source of the data, to be used if pipe does not specify a source
 * @returns a pipe component which renders a link to the data
 */
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

/**
 * a HOF to create a tag component for a tag type without boilerplate
 * @param tagString the string which represents the html intrinsic element
 * @param obj class or style to apply to the element
 * @returns a component function which renders its children as the styled children of the intrinsic element
 */
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

/**
 * HOF to create a tag component that also templates its children
 * @param tagString the string which represents the html intrinsic element
 * @param templater a function which takes an element and returns the element with some template applied
 * @param obj options to apply to the element
 * @returns a component function which renders its children as the styled children of the intrinsic element, with template applied
 */
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
    dice: Crunch,
    hit: templateTag("code", (c) => <>d20{c}</>),
    damage: tag("code"),
    d20: templateTag("code", (c) => <>d20{c}</>),
    scaledice: pipe((props) => <code>{props.p2}</code>),
    scaledamage: pipe((props) => <code>{props.p2}</code>),
  })
);
