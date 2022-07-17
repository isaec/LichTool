import {
  Currency,
  currencyCopperArray,
  currencyCopperCommonArray,
  currencyToNameMap,
  Distances,
  DurationObject,
  spellEndsMap,
} from "@src/generalTypes";
import { DataSpell } from "@src/dataLookup";

/**
 * Ensure the first char of string is uppercase
 * @param s the string to capitalize
 * @returns string with first char capitalized
 */
export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/**
 * Ensure only the first char of string is uppercase
 * @param s the string to capitalize
 * @returns the string with ***only the first char*** capitalized
 */
export const upperFirst = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

/**
 * @param num the quantity of the description
 * @param str the unit of the description
 * @returns a string describing the data, pluralized if needed
 */
export const plural = (num: number, str: string) =>
  `${num} ${str}${num > 1 ? "s" : ""}`;

export const argList = (
  ...args: Array<string | undefined | [string | number | undefined, string]>
) =>
  args
    .filter((arg) => (Array.isArray(arg) ? arg[0] : arg) !== undefined)
    .map((arg) => (Array.isArray(arg) ? arg.join(" ") : arg))
    .join(", ");

const joinList = (
  list: Readonly<string[]>,
  joiner: string,
  serialJoin: boolean,
  lastJoiner: string
) =>
  list.length > 2
    ? `${list.slice(0, -1).join(`${joiner} `)}${
        serialJoin ? joiner : ""
      } ${lastJoiner} ${list[list.length - 1]}`
    : list.join(` ${lastJoiner} `);

export const fmtAndList = (list: Readonly<string[]>, serialComma = true) =>
  joinList(list, ",", serialComma, "and");

export const fmtOrList = (list: Readonly<string[]>, serialComma = true) =>
  joinList(list, ",", serialComma, "or");

const pastTenseMap = new Map<Distances, string>([
  ["miles", "mile"],
  ["feet", "foot"],
]);

const shortenDistanceMap = new Map<Distances, string>([
  ["miles", "mi"],
  ["feet", "ft"],
]);

const dispDistance = (str: Distances, shorten: boolean) =>
  shorten ? shortenDistanceMap.get(str) : str;

const dispPastDistance = (str: Distances, shorten: boolean) =>
  shorten ? shortenDistanceMap.get(str) : pastTenseMap.get(str);

export const fmtRange = (data: DataSpell["range"], shorten = false) => {
  if (data.distance === undefined) return capitalize(data.type);
  if (data.distance.amount === undefined) return capitalize(data.distance.type);
  switch (data.type) {
    case "point":
      // handle the case of single mile, the only unit to be plural
      if (data.distance.type === "miles" && data.distance.amount === 1)
        return "1 mile";
      return capitalize(
        `${data.distance.amount} ${dispDistance(data.distance.type, shorten)}`
      );
    case "sphere":
      // sphere is weird, its an alias of range
      return `${data.distance.amount}-${dispPastDistance(
        data.distance.type,
        shorten
      )} radi`;
    case "radius":
    case "line":
    case "cube":
    case "cone":
      return `${data.distance.amount}-${dispPastDistance(
        data.distance.type,
        shorten
      )} ${shorten ? data.type.slice(0, 4) : data.type}`;

    default:
      return capitalize(
        `${data.type} ${data.distance.type} ${data.distance.amount}`
      );
  }
};

export const fmtDuration = (data: DurationObject) => {
  switch (data.type) {
    case "timed":
      return capitalize(
        `${data.concentration ? "Concentration, " : ""}${
          data.duration?.upTo ||
          (data.concentration && data.duration?.upTo !== false)
            ? "up to "
            : ""
        }${plural(data.duration!.amount!, data.duration!.type)}`
      );
    case "instant":
      return "Instantaneous";
    case "permanent":
      if (data.ends === undefined) return "Permanent";
      return `Until ${fmtOrList(
        data.ends.map((end) => spellEndsMap.get(end)!)
      )}`;
    default:
      return capitalize(data.type);
  }
};

/**
 *
 * @param value the number to format
 * @maxDecimal the maximum number of decimal places to display
 * @returns string representing the number, formatted with commas
 */
export const fmtNumber = (value: number, maxDecimal = 2) =>
  value.toLocaleString("en-US", {
    maximumFractionDigits: maxDecimal,
  });

/**
 * format a value in copper for display as currency.
 * @param value the value in copper to format for display
 * @param long if false, use abbreviated currency names and only commas
 * @param onlyCommon if true, only display using common currencies
 * @returns a string representing the value in copper
 */
export const fmtCurrency = (
  value: number,
  long = false,
  onlyCommon = true
): string => {
  const disp: (n: number, c: Currency) => string = long
    ? (n, c) => `${fmtNumber(n)} ${currencyToNameMap.get(c)!}`
    : (n, c) => `${fmtNumber(n)} ${c}`;

  if (value <= 1) return disp(value, "cp");

  let remainder = value;
  const results: string[] = [];

  const refArray = onlyCommon ? currencyCopperCommonArray : currencyCopperArray;

  while (remainder > 0) {
    for (let i = refArray.length - 1; i >= 0; i--) {
      if (remainder < refArray[i][1]) continue;

      const [unit, unitValue] = refArray[i];
      const reductionInUnits = Math.floor(remainder / unitValue);
      const reductionCopper = reductionInUnits * unitValue;
      remainder -= reductionCopper;
      results.push(disp(reductionInUnits, unit));
      break;
    }
  }
  return long ? fmtAndList(results) : results.join(", ");
};

// this is a hacky solution for lowercase titles...
const leaveLowerCase = new Set([
  "without",
  "and",
  "as",
  "an",
  "at",
  "a",
  "but",
  "by",
  "for",
  "from",
  "if",
  "in",
  "into",
  "like",
  "near",
  "nor",
  "of",
  "off",
  "on",
  "once",
  "onto",
  "or",
  "over",
  "past",
  "so",
  "than",
  "that",
  "till",
  "to",
  "up",
  "upon",
  "with",
  "when",
  "yet",
  "via",
  "the",
]);

const extractType = /\w+(?=_)/;
export const extractTypeFromUrl = (url: string): string | "unknown" => {
  const match = url.match(extractType);
  if (match) return match[0];
  return "unknown";
};

const wordsRegex = /([^\s\-\/]+)([\s\-\/])?/gm;
export const fmtNameForUrl = (name: string): string => {
  const words = Array.from(name.matchAll(wordsRegex));
  const result: string[] = [];
  words.forEach(([, word, sep]) => {
    if (leaveLowerCase.has(word.toLowerCase())) {
      result.push(word.toLowerCase());
    } else {
      result.push(upperFirst(word));
    }
    if (sep) {
      if (sep === " ") result.push("-");
      else result.push(sep);
    }
  });
  return result.join("");
};
export const fmtDataUrl = (type: string, name: string, source: string) =>
  `${type.toLowerCase()}_${source.toUpperCase()}-${fmtNameForUrl(name)}`;
