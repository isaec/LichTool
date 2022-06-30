import { DataSpell } from "./components/Renderer/types";

const baseRanges = new Set(["self", ""]);
export const fmtRange = (data: DataSpell["range"]) => {
  if (data.distance === undefined) return data.type;
  if (data.distance.amount === undefined) return data.distance.type;
  return `${data.type} ${data.distance.type} ${data.distance.amount}`;
};
