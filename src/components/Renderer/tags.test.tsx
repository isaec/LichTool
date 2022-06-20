import { Dynamic } from "solid-js/web";
import { render } from "solid-testing-library";
import { vi, expect, describe, it, test } from "vitest";
import styles from "./Renderer.module.scss";
import { tagMap } from "./tags";

vi.mock("./Renderer.module.scss", () => ({
  default: new Proxy(new Object(), {
    get(_, style) {
      return style;
    },
  }),
}));

describe("tags", () => {
  const needPipe = new Set(["color", "link", "filter"]);
  it.each([
    ["color", "test|ffffff"],
    ["color", "test|f00"],
    ["color", "test|illegal-color"],
    ["color", "test|fff|bonus-pipe"],
    ...[...tagMap.keys()]
      .filter((tag) => !needPipe.has(tag))
      .map((key) => [key, `${key} string!`]),
  ])(`{@%s %s} matches snapshot`, (tag, children) => {
    const { unmount, container } = render(() => (
      <Dynamic component={tagMap.get(tag)} children={children} />
    ));

    expect(container).toMatchSnapshot();
    unmount();
  });
});
