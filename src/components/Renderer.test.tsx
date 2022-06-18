import { describe, expect, it } from "vitest";
import { render, fireEvent } from "solid-testing-library";
import dataJson from "../data/renderdemo.json?raw";

import Renderer from "./Renderer";

describe("Renderer", () => {
  it("will render without crashing", () => {
    const { unmount, getByText } = render(() => <Renderer data={dataJson} />);
    expect(getByText("fireball")).toBeInTheDocument();
    unmount();
  });
});
