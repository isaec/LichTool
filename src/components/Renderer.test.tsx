import { describe, expect, it, vi } from "vitest";
import { render, fireEvent, queryAllByText } from "solid-testing-library";
// @ts-ignore
import renderdemo from "../data/renderdemo.json";

import styles from "./Renderer.module.scss";

import Renderer, { _parseData } from "./Renderer";

vi.mock("./Renderer.module.scss", () => ({
  default: new Proxy(new Object(), {
    get(_, style) {
      return style;
    },
  }),
}));

describe("_parseData", () => {
  it.each([
    { key: 10, anotherKey: "string" },
    { nest: { very: { deeply: { bool: true } } } },
  ])("parses string json into object json", (obj) => {
    expect(_parseData(JSON.stringify(obj))).toStrictEqual(obj);
  });

  it.each(["this is a string!"])("parses naked strings into strings", (str) => {
    expect(_parseData(str)).toStrictEqual(str);
  });

  it.each(["this is a string!"])(
    "parses quoted strings into strings",
    (str) => {
      expect(_parseData(`"${str}"`)).toBe(str);
    }
  );

  it.each([
    {
      type: "~",
    },
    {
      type: "some other type",
    },
  ])("returns safe objects", (obj) => {
    expect(_parseData(obj)).toStrictEqual(obj);
  });

  it.each([
    {
      type: null,
    },
    {
      type: 10,
    },
    {
      notTyped: "lol",
    },
  ])("throws error on a clearly unsafe object", (obj) => {
    expect(() => _parseData(obj)).toThrow();
  });
});

describe("Renderer", () => {
  describe("e2e tests", () => {
    it("matches snapshot", () => {
      const { unmount, container } = render(() => (
        <Renderer data={JSON.stringify(renderdemo.data[0])} />
      ));
      expect(container).toMatchSnapshot();
      unmount();
    });
  });

  describe("unnested tags", () => {
    it("renders bold", () => {
      const { unmount, container } = render(() => (
        <Renderer data="this is some text, {@bold and now its bold} {@b with shorthand, too!}" />
      ));
      expect(container.querySelectorAll(`.${styles.Renderer} > *`))
        .toMatchInlineSnapshot(`
      NodeList [
        <p>
          this is some text, 
          <b>
            and now its bold
          </b>
           
          <b>
            with shorthand, too!
          </b>
        </p>,
      ]
    `);
      unmount();
    });
    it("renders italic, strikes, underline", () => {
      const { unmount, container } = render(() => (
        <Renderer data="this is some text, {@strike and now its struck} {@u underline} {@i with italic shorthand, too!}" />
      ));
      expect(container.querySelectorAll(`.${styles.Renderer} > *`))
        .toMatchInlineSnapshot(`
        NodeList [
          <p>
            this is some text, 
            <s>
              and now its struck
            </s>
             
            <span
              class="underline"
            >
              underline
            </span>
             
            <i>
              with italic shorthand, too!
            </i>
          </p>,
        ]
      `);
      unmount();
    });
    it.each([
      "waa {@b bold} {@b never ever closing!",
      "waa {@b never ever closing! {@b bold}",
      `${"e {@i wee}".repeat(50)}{@b ${"e".repeat(50)}`,
      `${"e".repeat(50)}{@underline ${`${"e i o u ".repeat(
        10
      )}{@b bold} `.repeat(5)}`,
    ])("doesn't error when rendering unclosed tags", (str) => {
      const { unmount, container } = render(() => <Renderer data={str} />);
      expect(container.querySelectorAll(`.${styles.error}`).length).toBe(0);
      unmount();
    });
  });

  describe("nested tags", () => {
    it("renders nested tags", () => {
      const { unmount, container } = render(() => (
        <Renderer data="some text: {@b bolded {@i and italic} and now just bold}" />
      ));
      expect(container.querySelectorAll(`.${styles.Renderer} > *`))
        .toMatchInlineSnapshot(`
      NodeList [
        <p>
          some text: 
          <b>
            bolded 
            <i>
              and italic
            </i>
             and now just bold
          </b>
          
        </p>,
      ]
    `);
      unmount();
    });

    it.each(["{@b bold {@i italic{ lol}} {@", "{@b bold {@i italic{lol}}{@"])(
      "catches errors when parsing illegal strings",
      (str) => {
        const { unmount, queryByText } = render(() => <Renderer data={str} />);
        // there should be no error that reaches the error boundary
        expect(queryByText(/renderer caught an uncaught/)).toBeNull();
        unmount();
      }
    );

    const nestedTags = [];
    for (let i = 0; i <= 4; i++) {
      nestedTags.push(`{@b bold {@i italic}${" ".repeat(i)}}`);
    }
    it.each(nestedTags)(
      "renders nested tags correctly with arbitrary spaces",
      (str) => {
        const { unmount, getByText } = render(() => <Renderer data={str} />);
        expect((getByText(/bold/) as HTMLElement).tagName).toBe("B");
        expect((getByText(/italic/) as HTMLElement).tagName).toBe("I");
        unmount();
      }
    );
    it("renders complex nesting of tags", () => {
      const { unmount, container, getByText } = render(() => (
        <Renderer data="some text: {@b bolded {@i and italic} and now just bold - now {@s struck bold! {@underline underline {@italic italic}}}, bold}, more text ({@i italic})" />
      ));
      // @ts-ignore
      expect(getByText(/some text:/)).toBeInTheDocument();
      expect((getByText(/some text:/) as HTMLElement).tagName).toBe("P");
      expect((getByText(/bolded/) as HTMLElement).tagName).toBe("B");
      expect((getByText(/and italic/) as HTMLElement).tagName).toBe("I");
      expect((getByText(/struck bold!/) as HTMLElement).tagName).toBe("S");
      // fragile test...
      expect(
        (getByText(/underline/) as HTMLElement).classList.contains(
          styles.underline
        )
      ).toBe(true);

      const braces = queryAllByText(container, /[{}]/);
      expect(braces.length).toBe(0);

      expect(container.querySelectorAll(`.${styles.Renderer} > *`))
        .toMatchInlineSnapshot(`
        NodeList [
          <p>
            some text: 
            <b>
              bolded 
              <i>
                and italic
              </i>
               and now just bold - now 
              <s>
                struck bold! 
                <span
                  class="underline"
                >
                  underline 
                  <i>
                    italic
                  </i>
                  
                </span>
                
              </s>
              , bold
            </b>
            , more text (
            <i>
              italic
            </i>
            )
          </p>,
        ]
      `);

      unmount();
    });
  });
});
