import { Distances } from "./components/generalTypes";
import { DataSpell } from "@src/dataLookup";

const capitalize = (s: string) => s[0].toUpperCase() + s.slice(1);

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

// this is a hacky solution for lowercase titles...
const leaveLowerCase = new Set([
  "without",
  "and",
  "as",
  "at",
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

export const fmtDataUrl = (type: string, name: string, source: string) =>
  `${type.toLowerCase()}_${source.toUpperCase()}-${name
    .split(/\s/)
    .map((s) =>
      leaveLowerCase.has(s.toLowerCase())
        ? s.toLowerCase()
        : `${s[0].toUpperCase()}${s.slice(1)}`
    )
    .join("-")}`;
