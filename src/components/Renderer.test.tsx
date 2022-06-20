import { describe, expect, it } from "vitest";
import { render, fireEvent, queryAllByText } from "solid-testing-library";
// @ts-ignore
import renderdemo from "../data/renderdemo.json";

import styles from "./Renderer.module.scss";

import Renderer, { _parseData } from "./Renderer";

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
  it("matches snapshot", () => {
    const { unmount, container } = render(() => (
      <Renderer data={JSON.stringify(renderdemo.data[0])} />
    ));
    expect(container).toMatchSnapshot();
    unmount();
  });
  it("renders bold", () => {
    const { unmount, container } = render(() => (
      <Renderer data="this is some text, {@bold and now its bold} {@b with shorthand, too!}" />
    ));
    expect(
      container.querySelectorAll(`.${styles.Renderer} > *`)
    ).toMatchInlineSnapshot(
      `
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
    `
    );
    unmount();
  });
  it("renders italic, strikes, underline", () => {
    const { unmount, container } = render(() => (
      <Renderer data="this is some text, {@strike and now its struck} {@u underline} {@i with italic shorthand, too!}" />
    ));
    expect(
      container.querySelectorAll(`.${styles.Renderer} > *`)
    ).toMatchInlineSnapshot(
      `
      NodeList [
        <p>
          this is some text, 
          <s>
            and now its struck
          </s>
           
          <span
            class="_underline_18sns_29"
          >
            underline
          </span>
           
          <i>
            with italic shorthand, too!
          </i>
        </p>,
      ]
    `
    );
    unmount();
  });
  it("renders nested tags", () => {
    const { unmount, container } = render(() => (
      <Renderer data="some text: {@b bolded {@i and italic} and now just bold}" />
    ));
    expect(
      container.querySelectorAll(`.${styles.Renderer} > *`)
    ).toMatchInlineSnapshot(
      `
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
    `
    );
    unmount();
  });
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
                  class="_underline_18sns_29"
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
