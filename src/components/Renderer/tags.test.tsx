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
    ["link", "example"],
    ["link", "https://example.com"],
    ["link", "example|https://example.com"],
    [
      "filter",
      "Races that have a bonus to Intelligence|races|Ability Bonus (Including Subrace)=Intelligence +any",
    ],
    [
      "filter",
      "Bard cantrips and first-level spells|spells|level=0;1|class=bard",
    ],
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
