// embedding raw is a performance optimization
// https://v8.dev/blog/cost-of-javascript-2019#json
import data from "@data/data.json?raw";
import filters from "@data/filters.json?raw";
import {
  Distances,
  Durations,
  Levels,
  Ranges,
  SchoolAbbreviations,
  Sources,
  DurationUnits,
  TimeObject,
  DurationObject,
  ComponentsObject,
  Abilities,
  ItemTypes,
  ItemRarity,
} from "@src/generalTypes";
import { DataGroup } from "./components/Renderer/types";
import { extractTypeFromUrl } from "./formatter";

export const isType =
  <T extends DataUnion>(type: string) =>
  (dataObj: DataUnion): dataObj is T =>
    extractTypeFromUrl(dataObj.id) === type;

export type IdData = {
  id: string;
  name: string;
  source: Sources;
};

export type RawData<T> = Omit<T, "id">;

export type RawDataSpell = RawData<DataSpell>;
export const isDataSpell = isType<DataSpell>("spell");
export type DataSpell = IdData & {
  level: Levels;
  school: SchoolAbbreviations;
  time: TimeObject[];
  range: { type: Ranges; distance?: { type: Distances; amount?: number } };
  components: ComponentsObject;
  duration: DurationObject[];
  entries: DataGroup;
  entriesHigherLevel?: DataGroup;
  page: number;
  savingThrow?: Abilities[];
  abilityCheck?: Abilities[];
  /**
   * M: Melee
   * R: Ranged
   * O: Other/Unknown
   */
  spellAttack?: Array<"M" | "R" | "O">;
  srd?: boolean;
  basicRules?: boolean;
  meta?: {
    ritual?: boolean;
  };
};

export type RawDataItem = RawData<DataItem>;
export const isDataItem = isType<DataItem>("item");
export type DataItem = IdData & {
  page: number;
  srd?: boolean;
  basicRules?: boolean;
  type?: ItemTypes;
  rarity?: ItemRarity;
  entries?: DataGroup;
  additionalEntries?: DataGroup;
};

export type RawConditionData = RawData<DataCondition>;
export const isDataCondition = isType<DataCondition>("condition");
export type DataCondition = IdData & {
  entries: DataGroup;
  page: number;
  srd?: boolean;
  basicRules?: boolean;
};

export type RawDiseaseData = RawData<DataDisease>;
export const isDataDisease = isType<DataDisease>("disease");
export type DataDisease = IdData & {
  entries: DataGroup;
  page: number;
  srd?: boolean;
};

export type RawStatusData = RawData<DataStatus>;
export const isDataStatus = isType<DataStatus>("status");
export type DataStatus = IdData & {
  name: string;
  entries: DataGroup;
  source: Sources;
  page: number;
  srd?: boolean;
  basicRules?: boolean;
};

export type DataUnion =
  | DataSpell
  | DataItem
  | DataCondition
  | DataDisease
  | DataStatus;

// data object collections

/** the array of all spells - id is always undefined */
export const dataArray = JSON.parse(data) as Array<DataUnion>;

/**
map from id to data.
*/
export const dataMap = new Map(
  dataArray.map((data) => [data.id, data])
) as ReadonlyMap<string, DataUnion>;

type ValueTypes = string | number | boolean;

/**
 * an array of all possible values for a filter
 */
export const filterMap = new Map<string, ValueTypes[]>(JSON.parse(filters));

/**
 * The keys of {@link filterMap} as an array
 */
export const filterKeys = [...filterMap.keys()];
