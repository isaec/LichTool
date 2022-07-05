import { DataSpell } from "./components/Renderer/types";

const capitalize = (s: string) => s[0].toUpperCase() + s.slice(1);

const baseRanges = new Set(["self", ""]);
export const fmtRange = (data: DataSpell["range"]) => {
  if (data.distance === undefined) return capitalize(data.type);
  if (data.distance.amount === undefined) return capitalize(data.distance.type);
  switch (data.type) {
    case "point":
      // handle the case of single mile, the only unit to be plural
      if (data.distance.type === "miles" && data.distance.amount === 1)
        return "1 mile";
      return capitalize(`${data.distance.amount} ${data.distance.type}`);
    default:
      return capitalize(
        `${data.type} ${data.distance.type} ${data.distance.amount}`
      );
  }
};
