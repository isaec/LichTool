import { Component } from "solid-js";
import { Dynamic } from "solid-js/web";
import { render } from "solid-testing-library";
import { vi, expect, describe, it, test } from "vitest";
import { combinate } from "../../combinate";
import entryTypes from "./entryTypes";
import styles from "./Renderer.module.scss";
import { DataNode, InsetData, ListData, QuoteData, SectionData } from "./types";

vi.mock("./Renderer.module.scss", () => ({
  default: new Proxy(new Object(), {
    get(_, style) {
      return style;
    },
  }),
}));

describe("entryTypes", () => {
  const sectionData: SectionData[] = [
    {
      type: "section",
      name: "name",
      entries: ["entry"],
    },
  ];
  const listData: ListData[] = [
    {
      type: "list",
      items: ["stuff"],
    },
  ];
  const insetData: Array<InsetData> = [
    {
      type: "inset",
      name: "name",
      entries: ["a", "b", "c"],
    },
    {
      type: "inset",
      name: "name",
      entries: ["woo"],
    },
  ];
  const quoteData: Array<QuoteData> = [
    ...combinate<QuoteData>(["by", "from"], {
      type: "quote",
      entries: ["Look, don't quote me on this, but"],
      by: "Anon",
      from: "Archive of Lost Chats",
    }),
    {
      type: "quote",
      entries: ["e", "i", "o"],
      from: "place",
    },
  ];
  const tests: Array<DataNode> = [
    ...sectionData,
    ...listData,
    ...insetData,
    ...quoteData,
  ];
  it.each(tests)(`rendering %s matches snapshot`, (data) => {
    const { unmount, container } = render(() => (
      <Dynamic component={entryTypes.get(data.type) as any} data={data} />
    ));

    expect(container).toMatchSnapshot();
    unmount();
  });
});
