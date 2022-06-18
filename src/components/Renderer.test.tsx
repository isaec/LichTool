import { describe, expect, it } from "vitest";
import { render, fireEvent } from "solid-testing-library";
// @ts-ignore
import renderdemo from "../data/renderdemo.json";

import styles from "./Renderer.module.scss";

import Renderer from "./Renderer";

describe("Renderer", () => {
  it("matches snapshot", () => {
    const { unmount, container } = render(() => (
      <Renderer data={JSON.stringify(renderdemo.data[0])} />
    ));
    expect(container).toMatchSnapshot();
    unmount();
  });
  it("renders bold", () => {
    const { unmount, container } = render(() => (
      <Renderer data="this is some text, {@bold and now its bold} {@b with shorthand, too!}" />
    ));
    expect(
      container.querySelectorAll(`.${styles.Renderer} > *`)
    ).toMatchInlineSnapshot(
      `
      NodeList [
        <p>
          this is some text, 
          <b>
            and now its bold
          </b>
           
          <b>
            with shorthand, too!
          </b>
        </p>,
      ]
    `
    );
    unmount();
  });
  it("renders italic, strikes, underline", () => {
    const { unmount, container } = render(() => (
      <Renderer data="this is some text, {@strike and now its struck} {@u underline} {@i with italic shorthand, too!}" />
    ));
    expect(
      container.querySelectorAll(`.${styles.Renderer} > *`)
    ).toMatchInlineSnapshot(
      `
      NodeList [
        <p>
          this is some text, 
          <s>
            and now its struck
          </s>
           
          <span
            class="_underline_10aw3_16"
          >
            underline
          </span>
           
          <i>
            with italic shorthand, too!
          </i>
        </p>,
      ]
    `
    );
    unmount();
  });
  it("renders nested tags", () => {
    const { unmount, container } = render(() => (
      <Renderer data="some text: {@b bolded {@i and italic} and now just bold}" />
    ));
    expect(
      container.querySelectorAll(`.${styles.Renderer} > *`)
    ).toMatchInlineSnapshot(
      `
      NodeList [
        <p>
          some text: 
          <b>
            bolded 
            <i>
              and italic
            </i>
             and now just bold
          </b>
          
        </p>,
      ]
    `
    );
    unmount();
  });
});
