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
  TimeUnits,
} from "@src/generalTypes";
import { DataGroup } from "./components/Renderer/types";
import { extractTypeFromUrl } from "./formatter";

const isType =
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
  name: string;
  level: Levels;
  school: SchoolAbbreviations;
  time: { number: number; unit: "action" }[];
  range: { type: Ranges; distance?: { type: Distances; amount?: number } };
  components: { v?: boolean; s?: boolean; m?: string };
  duration: [
    {
      type: Durations;
      duration?: {
        type: TimeUnits;
        amount: number;
      };
      concentration?: boolean;
    }
  ];
  entries: DataGroup;
  entriesHigherLevel?: DataGroup;
  source: Sources;
  page: number;
  srd?: boolean;
  basicRules?: boolean;
  meta?: {
    ritual?: boolean;
  };
};

export type RawConditionData = RawData<DataCondition>;
export const isDataCondition = isType<DataCondition>("condition");
export type DataCondition = IdData & {
  name: string;
  entries: DataGroup;
  source: Sources;
  page: number;
  srd?: boolean;
  basicRules?: boolean;
};

export type RawDiseaseData = RawData<DataDisease>;
export const isDataDisease = isType<DataDisease>("disease");
export type DataDisease = IdData & {
  name: string;
  entries: DataGroup;
  source: Sources;
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

export type DataUnion = DataSpell | DataCondition | DataDisease | DataStatus;

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
