import { generate, one } from "generate-combinations";
import { render } from "solid-testing-library";
import { describe, expect, it, vi } from "vitest";
import DataSpellElement from "./DataSpellElement";
import {
  dataArray,
  DataSpell,
  isDataSpell,
  RawDataSpell,
} from "@src/dataLookup";

vi.mock("./DataElement.module.scss", () => ({
  default: new Proxy(new Object(), {
    get(_, style) {
      return style;
    },
  }),
}));

vi.mock("solid-app-router", () => ({
  ...import("solid-app-router"),
  Link: (props: any) => <a href={props.href}>{props.children}</a>,
}));

describe("DataSpellElement", () => {
  describe.each(
    dataArray
      .filter(isDataSpell)
      .map((data): [string, typeof data] => [data.name, data])
  )(`%s`, (_name, spell) => {
    it("matches snapshot", () => {
      const { unmount, container } = render(() => (
        <DataSpellElement data={spell} />
      ));

      expect(container).toMatchSnapshot();
      unmount();
    });
    it(`never renders with html containing "undefined"`, () => {
      const { unmount, container, queryByText } = render(() => (
        <DataSpellElement data={spell} />
      ));

      expect(queryByText(/undefined/i), "don't render undefined").toBeNull();
      unmount();
    });
    it(`never renders with html containing "[object Object]"`, () => {
      const { unmount, container, queryByText } = render(() => (
        <DataSpellElement data={spell} />
      ));

      expect(
        queryByText(/\[object Object\]/),
        "don't render [object Object]"
      ).toBeNull();
      unmount();
    });
  });
});
