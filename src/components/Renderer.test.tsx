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
    expect(container).toMatchInlineSnapshot();
    unmount();
  });
});
