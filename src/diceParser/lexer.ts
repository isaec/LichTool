export enum TokenTypes {
  "NUMBER",
  "ID",
  "+",
  "-",
  "*",
  "/",
  "^",
  "(",
  ")",
  "EOF",
}
export type Token = Readonly<{ type: TokenTypes; match?: string }>;

type TokenMatcher = Readonly<{
  type: TokenTypes;
  re: RegExp;
}>;
const tokenMatchers: TokenMatcher[] = [
  { type: TokenTypes["NUMBER"], re: /^(?:\d+(?:\.\d*)?|\.\d+)/ },
  { type: TokenTypes["ID"], re: /^[A-Za-z]+/ },
  { type: TokenTypes["+"], re: /^\+/ },
  { type: TokenTypes["-"], re: /^-/ },
  { type: TokenTypes["*"], re: /^\*/ },
  { type: TokenTypes["/"], re: /^\// },
  { type: TokenTypes["^"], re: /^\^/ },
  { type: TokenTypes["("], re: /^\(/ },
  { type: TokenTypes[")"], re: /^\)/ },
];

const EOF: Token = { type: TokenTypes["EOF"] };

// https://github.com/jrop/pratt-calculator

export class Lexer {
  tokens: Token[];
  position: number;
  constructor(tokenArray: Token[]) {
    this.tokens = tokenArray;
    this.position = 0;
  }
  peek() {
    return this.tokens[this.position] || EOF;
  }
  next() {
    return this.tokens[this.position++] || EOF;
  }
  expect(type: TokenTypes) {
    const t = this.next();
    if (type != t.type)
      throw new Error(`Unexpected token: ${t.match || "<<EOF>>"}`);
  }
  eof() {
    return this.position >= this.tokens.length;
  }
}

export const lex = (str: string) => {
  const cleanString = str.replace(/\s+/g, ""); // remove whitespace

  let currentString = cleanString;

  const tokenStack: Token[] = [];
  while (currentString.length > 0) {
    const validTokenMatcher = tokenMatchers.find((tokenMatcher) =>
      tokenMatcher.re.test(currentString)
    );
    if (!validTokenMatcher) {
      throw new Error(`Unknown token: ${currentString}`);
    }
    // known to not be null because matched test execution above
    const match = validTokenMatcher.re.exec(currentString)![0];

    tokenStack.push({ type: validTokenMatcher.type, match: match });
    currentString = currentString.slice(match.length);
  }
  return new Lexer(tokenStack);
};
