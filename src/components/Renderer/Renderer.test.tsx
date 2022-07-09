import { describe, expect, it, vi } from "vitest";
import { render, fireEvent, queryAllByText } from "solid-testing-library";
import renderdemo from "@data/renderdemo.json";

import styles from "./Renderer.module.scss";

import Renderer, {
  isNestedTag,
  tagMatcher,
  unclosedTag,
  unclosedTagGroup,
} from "./Renderer";

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

  const expectRegexMatchConsistency = (str: string) => {
    const nested = isNestedTag.test(str);
    const unclosed = unclosedTag.test(str);
    expect({
      "tagMatcher matchAll": nested ? "nested!" : [...str.matchAll(tagMatcher)],
      "isNestedTag test": nested,
      "unclosedTag test & unclosedTagGroup match": !nested
        ? "not nested"
        : {
            "unclosedTag test": unclosed,
            "unclosedTagGroup match": !unclosed
              ? "not unclosed"
              : str.match(unclosedTagGroup),
          },
    }).toMatchSnapshot();
  };

  describe("unnested tags", () => {
    it("renders bold", () => {
      const data =
        "this is some text, {@bold and now its bold} {@b with shorthand, too!}";
      const { unmount, container } = render(() => <Renderer data={data} />);
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
      expectRegexMatchConsistency(data);
      unmount();
    });
    it("renders italic, strikes, underline", () => {
      const data =
        "this is some text, {@strike and now its struck} {@u underline} {@i with italic shorthand, too!}";
      const { unmount, container } = render(() => <Renderer data={data} />);
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
      expectRegexMatchConsistency(data);
      unmount();
    });
    it.each([
      "waa {@b bold} {@b never ever closing!",
      "waa {@b never ever closing! {@b bold}",
      `${"e {@i wee}".repeat(50)}{@b ${"e".repeat(50)}`,
      `${"e".repeat(50)}{@underline ${`${"e i o u ".repeat(
        10
      )}{@b bold} `.repeat(5)}`,
    ])(`doesn't error when rendering unclosed tags "%s"`, (str) => {
      const { unmount, container } = render(() => <Renderer data={str} />);
      expect(container.querySelectorAll(`.${styles.error}`).length).toBe(0);
      expectRegexMatchConsistency(str);
      unmount();
    });
  });

  describe("nested tags", () => {
    it("renders nested tags", () => {
      const data = "some text: {@b bolded {@i and italic} and now just bold}";
      const { unmount, container } = render(() => <Renderer data={data} />);
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
      expectRegexMatchConsistency(data);
      unmount();
    });

    it.each([
      "{@b bold {@i italic{ lol}} {@", // Cannot read properties of null (reading '0')
      "{@b bold {@i italic{lol}}{@", // Cannot read properties of null (reading '0')
      "{@b not} {@i lol {@b lmao}} {@ more text", // Maximum call stack size exceeded
    ])(`catches errors when parsing illegal string "%s"`, (str) => {
      const { unmount, queryByText } = render(() => <Renderer data={str} />);
      // there should be no error that reaches the error boundary
      expect(queryByText(/renderer caught an uncaught/)).toBeNull();
      unmount();
    });

    const nestedTags = [];
    for (let i = 0; i <= 4; i++) {
      nestedTags.push(`{@b bold {@i italic}${" ".repeat(i)}}`);
    }
    it.each(nestedTags)(
      `renders nested tags correctly with arbitrary spaces "%s"`,
      (str) => {
        const { unmount, getByText } = render(() => <Renderer data={str} />);
        expect((getByText(/bold/) as HTMLElement).tagName).toBe("B");
        expect((getByText(/italic/) as HTMLElement).tagName).toBe("I");
        expectRegexMatchConsistency(str);
        unmount();
      }
    );
    it("renders complex nesting of tags", () => {
      const data =
        "some text: {@b bolded {@i and italic} and now just bold - now {@s struck bold! {@underline underline {@italic italic}}}, bold}, more text ({@i italic})";
      const { unmount, container, getByText } = render(() => (
        <Renderer data={data} />
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
      expectRegexMatchConsistency(data);
      unmount();
    });
  });
});
