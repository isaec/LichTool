import { generate, one } from "generate-combinations";
import { render } from "solid-testing-library";
import { describe, expect, it } from "vitest";
import DataSpellElement from "./DataSpellElement";
import { DataSpell } from "./types";

describe.each([
  [
    "exhibits general behavior",
    generate<DataSpell>({
      name: "spell name",
      source: one(["PHB", "XGE"]),
      page: 219,
      level: 3,
      school: "I",
      time: [
        {
          number: 1,
          unit: "action",
        },
      ],
      range: {
        type: "point",
        distance: {
          type: "self",
        },
      },
      components: {
        v: true,
      },
      duration: [
        {
          type: "timed",
          duration: {
            type: "minute",
            amount: 1,
          },
          concentration: true,
        },
      ],
      entries: ["Entry text, {@b bold!}"],
    }),
  ],
  [
    "displays text for levels",
    generate<DataSpell>({
      name: "spell name",
      source: "PHB",
      page: 100,
      level: one([1, 2, 3, 4, 5]),
      school: "P",
      time: [
        {
          unit: "action",
          number: 1,
        },
      ],
      range: {
        type: "point",
        distance: {
          type: "self",
        },
      },
      components: {
        v: true,
      },
      duration: [
        {
          type: "timed",
          duration: {
            type: "minute",
            amount: 1,
          },
          concentration: false,
        },
      ],
      entries: ["lol"],
    }),
  ],
])(`DataSpellElement %s`, (description, data) => {
  it.each(data)("matches snapshot for %s", (data) => {
    const { unmount, container } = render(() => (
      <DataSpellElement data={data} />
    ));

    expect(container).toMatchSnapshot();
    unmount();
  });
});
