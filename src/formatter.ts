import { Distances, DurationObject } from "@src/generalTypes";
import { DataSpell } from "@src/dataLookup";

/**
 * Ensure the first char of string is uppercase
 * @param s the string to capitalize
 * @returns string with first char capitalized
 */
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
/**
 * Ensure only the first char of string is uppercase
 * @param s the string to capitalize
 * @returns the string with ***only the first char*** capitalized
 */
const upperFirst = (s: string) =>
  s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();

/**
 * @param num the quantity of the description
 * @param str the unit of the description
 * @returns a string describing the data, pluralized if needed
 */
const plural = (num: number, str: string) =>
  `${num} ${str}${num > 1 ? "s" : ""}`;

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
    default:
      return capitalize(data.type);
  }
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

const wordsRegex = /([\w']+)([\s\-\/])?/gm;
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
