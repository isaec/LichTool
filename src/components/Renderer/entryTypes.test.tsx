import { Component } from "solid-js";
import { Dynamic } from "solid-js/web";
import { render } from "solid-testing-library";
import { vi, expect, describe, it, test } from "vitest";
import entryTypes from "./entryTypes";
import styles from "./Renderer.module.scss";
import { DataNode } from "./types";

vi.mock("./Renderer.module.scss", () => ({
  default: new Proxy(new Object(), {
    get(_, style) {
      return style;
    },
  }),
}));

describe("entryTypes", () => {
  const tests: Array<DataNode> = [
    {
      type: "quote",
      entries: ["Look, don't quote me on this, but"],
      by: "Anon",
      from: "Archive of Lost Chats",
    },
    {
      type: "quote",
      entries: ["e"],
      by: "Anon",
    },
    {
      type: "quote",
      entries: ["e"],
      from: "place",
    },
    {
      type: "quote",
      entries: ["e", "i", "o"],
      from: "place",
    },
  ];
  it.each(tests)(`rendering %s matches snapshot`, (data) => {
    const { unmount, container } = render(() => (
      <Dynamic component={entryTypes.get(data.type) as any} data={data} />
    ));

    expect(container).toMatchSnapshot();
    unmount();
  });
});
