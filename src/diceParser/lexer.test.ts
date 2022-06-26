import { expect, it } from "vitest";
import { lex, Lexer, TokenTypes } from "./lexer";

const lexerPrint = (lexer: Lexer) =>
  `\n${lexer.tokens
    .map(
      (token) =>
        `${token.match}${" ".repeat(4 - token.match!.length)}${
          TokenTypes[token.type]
        }`
    )
    .join("\n")}`;

it("lexes a generic expression", () => {
  const lexer = lex("5 + 6");
  expect(lexerPrint(lexer)).toMatchInlineSnapshot(`
    "
    5   NUMBER
    +   +
    6   NUMBER"
  `);
});

it("lexes a complex dice expression", () => {
  const lexer = lex("5d6 + 2d20 / 2 + (1d2 ^ 5)");
  expect(lexerPrint(lexer)).toMatchInlineSnapshot(`
    "
    5   NUMBER
    d   ID
    6   NUMBER
    +   +
    2   NUMBER
    d   ID
    20  NUMBER
    /   /
    2   NUMBER
    +   +
    (   (
    1   NUMBER
    d   ID
    2   NUMBER
    ^   ^
    5   NUMBER
    )   )"
  `);
});
