const enum TokenTypes {
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

const lex = (str: string) => {
  const cleanString = str.replace(/\s+/g, ""); // remove whitespace

  const tkns = [];
  while (s.length > 0) {
    const token = tokens.find((t) => normalizeRegExp(t.re).test(s));
    const match = normalizeRegExp(token.re).exec(s);
    tkns.push({ type: token.type, match: match[0] });
    s = s.substr(match[0].length);
  }
  return new Lexer(tkns);
};
