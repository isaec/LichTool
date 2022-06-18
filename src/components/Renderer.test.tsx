import { describe, expect, it } from "vitest";
import { render, fireEvent } from "solid-testing-library";
// @ts-ignore
import renderdemo from "../data/renderdemo.json";

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
    expect(container).toMatchInlineSnapshot(
      `
      <div>
        <p
          class="_Renderer_10aw3_1"
        >
          <p>
            this is some text, 
            <b>
              and now its bold
            </b>
             
            <b>
              with shorthand, too!
            </b>
          </p>
        </p>
      </div>
    `
    );
    unmount();
  });
  it("renders italic, strikes", () => {
    const { unmount, container } = render(() => (
      <Renderer data="this is some text, {@strike and now its struck} {@b with shorthand, too!}" />
    ));
    expect(container).toMatchInlineSnapshot(
      `
      <div>
        <p
          class="_Renderer_10aw3_1"
        >
          <p>
            this is some text, 
            <s>
              and now its struck
            </s>
             
            <b>
              with shorthand, too!
            </b>
          </p>
        </p>
      </div>
    `
    );
    unmount();
  });
});
