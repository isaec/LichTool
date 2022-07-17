export type Levels = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
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
export type DurationUnits =
  | "hour"
  | "minute"
  | "turn"
  | "round"
  | "week"
  | "day"
  | "year";

export type SpellEnds = "dispel" | "trigger" | "discharge";
export const spellEndsMap = new Map<SpellEnds, string>([
  ["dispel", "dispelled"],
  ["trigger", "triggered"],
  ["discharge", "discharged"],
]);

export type DurationObject = {
  /** this determines if duration, ends matter */
  type: Durations;
  duration?: {
    type: DurationUnits;
    amount?: number;
    upTo?: boolean;
  };
  concentration?: boolean;
  ends?: SpellEnds[];
};

export type TimeUnits =
  | "action"
  | "bonus"
  | "reaction"
  | "round"
  | "minute"
  | "hour";

export type TimeObject = {
  number?: number;
  unit: TimeUnits;
  condition?: string;
};

export type ComponentsObject = {
  v?: boolean;
  s?: boolean;
  m?:
    | boolean
    | string
    | { text: string; cost?: number; consume?: boolean | string };
  r?: boolean;
};

/**
 * the different types an item can have
 */
export type ItemTypes =
  | "Treasure"
  | "Ammunition"
  | "Ammunition (futuristic)"
  | "Vehicle (air)"
  | "Artisan Tool"
  | "Eldritch Machine"
  | "Explosive"
  | "Food and Drink"
  | "Adventuring Gear"
  | "Gaming Set"
  | "Generic Variant"
  | "Heavy Armor"
  | "Instrument"
  | "Light Armor"
  | "Melee Weapon"
  | "Medium Armor"
  | "Mount"
  | "Master Rune "
  | "Other"
  | "Potion"
  | "Ranged Weapon"
  | "Rod"
  | "Ring"
  | "Shield"
  | "Scroll"
  | "Spellcasting Focus"
  | "Vehicle (water)"
  | "Tool"
  | "Tack and Harness"
  | "Trade Good"
  | "Vehicle (land)"
  | "Wand";

export type ItemRarity = "none" | "unknown" | "unknown (magic)" | "varies";

/*
Coin	      CP	SP	EP	GP	PP
cp value  	1	  10	50	100	1,000
*/

/**
 * shorthand string for currency
 */
export type Currency = "cp" | "sp" | "ep" | "gp" | "pp";
/**
 * maps from Currency to value in copper
 */
export const currencyToCopperMap = new Map<Currency, number>([
  ["cp", 1],
  ["sp", 10],
  ["ep", 50],
  ["gp", 100],
  ["pp", 1_000],
]);
export const currencyCopperArray = Array.from(currencyToCopperMap.entries());
/**
 * {@link currencyCopperArray} but without plat or electrum
 */
export const currencyCopperCommonArray = currencyCopperArray.filter(
  ([c]) => c !== "pp" && c !== "ep"
);
export const currencyToNameMap = new Map<Currency, string>([
  ["cp", "copper"],
  ["sp", "silver"],
  ["ep", "electrum"],
  ["gp", "gold"],
  ["pp", "platinum"],
]);
