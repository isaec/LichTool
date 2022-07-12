import { Component, JSX } from "solid-js";

const KeyValue: Component<{ key: string; children: JSX.Element }> = (props) => (
  <p>
    <b>{`${props.key}: `}</b>
    {props.children}
  </p>
);
export default KeyValue;
