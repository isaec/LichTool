import { DataSpell } from "./components/Renderer/types";

const capitalize = (s: string) => s[0].toUpperCase() + s.slice(1);

const baseRanges = new Set(["self", ""]);
export const fmtRange = (data: DataSpell["range"]) => {
  if (data.distance === undefined) return capitalize(data.type);
  if (data.distance.amount === undefined) return capitalize(data.distance.type);
  return capitalize(
    `${data.type} ${data.distance.type} ${data.distance.amount}`
  );
};
