import { Component } from "solid-js";
import { Dynamic } from "solid-js/web";
import { render } from "solid-testing-library";
import { vi, expect, describe, it, test } from "vitest";
import { generate, one, optional, illegal } from "generate-combinations";
import entryTypes from "./entryTypes";
import styles from "./Renderer.module.scss";
import {
  BonusData,
  BonusSpeed,
  DataNode,
  InsetData,
  InsetReadaloudData,
  ListData,
  QuoteData,
  SectionData,
} from "./types";

vi.mock("./Renderer.module.scss", () => ({
  default: new Proxy(new Object(), {
    get(_, style) {
      return style;
    },
  }),
}));

describe("entryTypes", () => {
  // this is used to test how embedded type behaves
  const inset: InsetData = { type: "inset", name: "name", entries: ["inset!"] };
  const tests: Array<DataNode> = [
    ...generate<SectionData>({
      type: "section",
      name: "name",
      entries: one([["entry"], ["entry", inset]]),
    }),
    ...generate<ListData>({
      type: "list",
      items: one([["stuff"], ["stuff", inset]]),
    }),
    ...generate<InsetData | InsetReadaloudData>({
      type: illegal<any, any>(one(["inset", "insetReadaloud"])),
      name: one(["name"]),
      entries: one([["woo"], ["a", "b", "c"]]),
    }),
    ...generate<QuoteData>({
      type: "quote",
      entries: one([
        ["body of the quote"],
        ["two entries", "for this quote"],
        ["quote with an", inset],
      ]),
      by: optional("author"),
      from: optional("source"),
    }),
    ...generate<BonusData>({
      type: "bonus",
      value: one([1, -2, 0]),
    }),
    ...generate<BonusSpeed>({
      type: "bonusSpeed",
      value: one([100, -2, 15]),
    }),
  ];
  it.each(tests)(`rendering %s matches snapshot`, (data) => {
    const { unmount, container } = render(() => (
      <Dynamic component={entryTypes.get(data.type) as any} data={data} />
    ));

    expect(container).toMatchSnapshot();
    unmount();
  });
});
