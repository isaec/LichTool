import { Distances } from "./components/generalTypes";
import { DataSpell } from "./components/Renderer/types";

const capitalize = (s: string) => s[0].toUpperCase() + s.slice(1);

const pastTenseMap = new Map<Distances, string>([
  ["miles", "mile"],
  ["feet", "foot"],
]);

export const fmtRange = (data: DataSpell["range"]) => {
  if (data.distance === undefined) return capitalize(data.type);
  if (data.distance.amount === undefined) return capitalize(data.distance.type);
  switch (data.type) {
    case "point":
      // handle the case of single mile, the only unit to be plural
      if (data.distance.type === "miles" && data.distance.amount === 1)
        return "1 mile";
      return capitalize(`${data.distance.amount} ${data.distance.type}`);
    case "sphere":
      // sphere is weird, its an alias of range
      return capitalize(
        `Self (${data.distance.amount}-${pastTenseMap.get(
          data.distance.type
        )} radius)`
      );
    case "radius":
    case "line":
    case "cube":
    case "cone":
      return capitalize(
        `Self (${data.distance.amount}-${pastTenseMap.get(
          data.distance.type
        )} ${data.type})`
      );
    default:
      return capitalize(
        `${data.type} ${data.distance.type} ${data.distance.amount}`
      );
  }
};

export const fmtDataUrl = (type: string, name: string, source: string) =>
  `${type}_${source}-${name.replaceAll(/\s/g, "-")}`;
