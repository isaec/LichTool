import { dataArray, isDataItem } from "@src/dataLookup";
import { render } from "solid-testing-library";
import DataItemElement from "./DataItemElement";

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

describe("DataItemElement", () => {
  describe.each(
    dataArray
      .filter(isDataItem)
      .map((data): [string, typeof data] => [data.name, data])
  )(`%s`, (_name, item) => {
    it("matches snapshot", () => {
      const { unmount, container } = render(() => (
        <DataItemElement data={item} />
      ));

      expect(container).toMatchSnapshot();
      unmount();
    });
    it(`never renders with html containing "undefined"`, () => {
      const { unmount, container, queryByText } = render(() => (
        <DataItemElement data={item} />
      ));

      expect(queryByText(/undefined/i), "don't render undefined").toBeNull();
      unmount();
    });
    it(`never renders with html containing "[object Object]"`, () => {
      const { unmount, container, queryByText } = render(() => (
        <DataItemElement data={item} />
      ));

      expect(
        queryByText(/\[object Object\]/),
        "don't render [object Object]"
      ).toBeNull();
      unmount();
    });
  });
});
