import { Token, TokenTypes, Lexer } from "./lexer";

// lowest is strongest
const TokenBindingPower = new Map([
  [TokenTypes.EOF, 0],
  [TokenTypes.NUMBER, 0],
  [TokenTypes[")"], 0],
  [TokenTypes["+"], 20],
  [TokenTypes["-"], 20],
  [TokenTypes["*"], 30],
  [TokenTypes["/"], 30],
  [TokenTypes["^"], 40],
  [TokenTypes["("], 50],
]);

const PrefixParseFn = new Map([
  [TokenTypes.NUMBER, (token: Token) => parseInt(token.match)],
]);

// const parse = (lexer: Lexer) => {
