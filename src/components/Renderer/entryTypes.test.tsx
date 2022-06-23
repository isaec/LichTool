import { Component } from "solid-js";
import { Dynamic } from "solid-js/web";
import { render } from "solid-testing-library";
import { vi, expect, describe, it, test } from "vitest";
import { generate, one, optional } from "../../combinate";
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
    ...generate<QuoteData>({
      type: "quote",
      entries: one([["body of the quote"], ["two entries", "for this quote"]]),
      by: optional("author"),
      from: optional("source"),
    }),
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
