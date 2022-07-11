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
} from "@components/generalTypes";
import { DataGroup } from "./components/Renderer/types";

export type IdData = {
  id: string;
};

export type RawData<T> = Omit<T, "id">;

export type RawDataSpell = RawData<DataSpell>;
export type DataSpell = IdData & {
  idType: "spell";
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

type DataUnion =
  | DataSpell
  | {
      id: string;
    };

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
