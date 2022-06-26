import { Component } from "solid-js";
import { Dynamic } from "solid-js/web";
import { render } from "solid-testing-library";
import { vi, expect, describe, it, test } from "vitest";
import { generate, one, optional } from "generate-combinations";
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
  const inset: InsetData = { type: "inset", name: "name", entries: ["inset!"] };
  const sectionData = generate<SectionData>({
    type: "section",
    name: "name",
    entries: one([["entry"], ["entry", inset]]),
  });
  const listData: ListData[] = generate<ListData>({
    type: "list",
    items: one([["stuff"], ["stuff", inset]]),
  });
  const insetData = generate<InsetData>({
    type: "inset",
    name: one(["name"]),
    entries: one([["woo"], ["a", "b", "c"]]),
  });
  const quoteData = generate<QuoteData>({
    type: "quote",
    entries: one([
      ["body of the quote"],
      ["two entries", "for this quote"],
      ["quote with an", inset],
    ]),
    by: optional("author"),
    from: optional("source"),
  });
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
