export type Levels = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
// this is redundant but the types are better for it?
export type SchoolAbbreviations =
  | "V"
  | "D"
  | "I"
  | "N"
  | "C"
  | "A"
  | "E"
  | "T"
  | "P";
export type Schools =
  | "Evocation"
  | "Divination"
  | "Illusion"
  | "Necromancy"
  | "Conjuration"
  | "Abjuration"
  | "Enchantment"
  | "Transmutation"
  | "Psionic";
export const schoolAbbreviationMap: Map<SchoolAbbreviations, Schools> = new Map(
  [
    ["V", "Evocation"],
    ["D", "Divination"],
    ["I", "Illusion"],
    ["N", "Necromancy"],
    ["C", "Conjuration"],
    ["A", "Abjuration"],
    ["E", "Enchantment"],
    ["T", "Transmutation"],
    ["P", "Psionic"],
  ]
);
export type Sources = "PHB" | "XGE" | "SCAG";
