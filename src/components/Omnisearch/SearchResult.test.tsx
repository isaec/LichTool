import { dataArray, isType } from "@src/dataLookup";
import { extractTypeFromUrl } from "@src/formatter";
import { Dynamic } from "solid-js/web";
import { render } from "solid-testing-library";
import { describe, expect, it, vi } from "vitest";
import { getHead, getResult } from "./SearchResult";

const dataTypes = [
  ...new Set(dataArray.map((data) => extractTypeFromUrl(data.id))),
] as const;

vi.mock("solid-app-router", () => ({
  ...import("solid-app-router"),
  Link: (props: any) => <a href={props.href}>{props.children}</a>,
  useNavigate: () => (arg0: string) => undefined,
}));

describe("Headers", () => {
  describe.each(dataTypes)("%s", (type) => {
    it("matches snapshot", () => {
      const { unmount, container } = render(() => (
        <Dynamic component={getHead(type)} type={type} />
      ));

      expect(container).toMatchSnapshot();
      unmount();
    });
  });
});

describe("Results", () => {
  describe.each(dataTypes)("%s", (type) => {
    it.each(
      dataArray
        .filter(isType(type))
        .map((data): [string, typeof data] => [data.name, data])
    )("%s matches snapshot", (_name, data) => {
      const { unmount, container } = render(() => (
        <Dynamic component={getResult(type)} id={data.id} />
      ));

      expect(container).toMatchSnapshot();
      unmount();
    });
  });
});
