import { fail } from "assert";
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

vi.mock("solid-app-router", () => ({
  ...import("solid-app-router"),
  Link: (props: any) => <a href={props.href}>{props.children}</a>,
}));

describe("tags", () => {
  const needPipe = new Set([
    "color",
    "link",
    "filter",
    "scaledice",
    "scaledamage",
    "spell",
    "condition",
    "action",
  ]);
  const pipeTests = [
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
    ["scaledice", "2d6;3d6|2-9|1d6"],
    ["spell", "name of spell"],
    ["spell", "name of spell|XGE"],
    ["spell", "name of spell|XGE|displayed text"],
    ["condition", "name of condition"],
    ["scaledamage", "8d8|4-9|1d8"],
    ["action", "name of action"],
    ["action", "name of action|XGE"],
    ["action", "name of action|XGE|displayed text"],
  ];
  it.each([
    ...pipeTests,
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

  // find missing explicit tests
  [...needPipe.entries()].forEach(([pipeName]) => {
    if (!pipeTests.some(([tag]) => tag === pipeName)) {
      fail(`write explicit test for ${pipeName}`);
    }
  });
});
