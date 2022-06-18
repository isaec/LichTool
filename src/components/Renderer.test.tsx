import { describe, expect, it } from "vitest";
import { render, fireEvent } from "solid-testing-library";
import renderdemo from "../data/renderdemo.json";

import Renderer from "./Renderer";

describe("Renderer", () => {
  it("will render without crashing", () => {
    const { unmount, getByText } = render(() => (
      <Renderer data={JSON.stringify(renderdemo.data[0])} />
    ));
    expect(getByText("Renderer Demo")).toBeInTheDocument();

    unmount();
  });
});
