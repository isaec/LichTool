// embedding raw is a performance optimization
// https://v8.dev/blog/cost-of-javascript-2019#json
import data from "@data/data.json?raw";
import filters from "@data/filters.json?raw";
import { DataSpell } from "./components/Renderer/types";

type DataUnion = DataSpell;

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
