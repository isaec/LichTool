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
/**
 * map from abbreviation to school name
 */
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
export type Sources = "PHB" | "XGE" | "SCAG" | "DMG";
export type Distances =
  | "feet"
  | "miles"
  | "self"
  | "touch"
  | "unlimited"
  | "plane"
  | "sight";
export type Ranges =
  | "special"
  | "point"
  | "line"
  | "cube"
  | "cone"
  | "radius"
  | "sphere"
  | "hemisphere"
  | "cylinder";
export type DamageTypes =
  | "acid"
  | "bludgeoning"
  | "cold"
  | "fire"
  | "force"
  | "lightning"
  | "necrotic"
  | "piercing"
  | "poison"
  | "psychic"
  | "radiant"
  | "slashing"
  | "thunder";
export type Abilities =
  | "strength"
  | "constitution"
  | "dexterity"
  | "intelligence"
  | "wisdom"
  | "charisma";
export type Durations = "instant" | "timed" | "permanent" | "special";
export type TimeUnits =
  | "hour"
  | "minute"
  | "turn"
  | "round"
  | "week"
  | "day"
  | "year";
