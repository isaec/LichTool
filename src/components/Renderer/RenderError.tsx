import { Component } from "solid-js";

import styles from "./Renderer.module.scss";

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
export default RenderError;
