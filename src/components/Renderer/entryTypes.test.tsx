import { Component } from "solid-js";
import { Dynamic } from "solid-js/web";
import { render } from "solid-testing-library";
import { vi, expect, describe, it, test } from "vitest";
import entryTypes from "./entryTypes";
import styles from "./Renderer.module.scss";

vi.mock("./Renderer.module.scss", () => ({
  default: new Proxy(new Object(), {
    get(_, style) {
      return style;
    },
  }),
}));

describe("entryTypes", () => {
  it.each([["section", {}]])(`{@%s %s} matches snapshot`, (type, data) => {
    const { unmount, container } = render(() => (
      <Dynamic component={entryTypes.get(type) as Component} children={data} />
    ));

    expect(container).toMatchSnapshot();
    unmount();
  });
});
