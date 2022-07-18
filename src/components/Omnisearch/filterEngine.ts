import toast from "solid-toast";
import { dataMap, filterMap } from "@src/dataLookup";

export type FilterData = {
  key: string;
  value: string;
};
export type PopulatedFilter = FilterData & {
  use: true;
};
export type BlankFilter = Partial<FilterData> & {
  use: false;
};
export type Filter = BlankFilter | PopulatedFilter;

export const isBlank = (filter: Filter): filter is BlankFilter => !filter.use;
export const isPopulated = (filter: Filter): filter is PopulatedFilter =>
  filter.use;

/**
 * this is a cache of parsed filters, but only expensive filters will be cached
 */
const filterParseMap = new Map<string, ReturnType<typeof parseFilter>>();

const isOnlyDigits = /^\d+$/;
// flags m i and u aren't that useful, but are allowed
// i is the most useful of them
const isValidRegex = /^\/(.+)\/([miu]*)$/;
export const parseFilter = (
  filter: string
): boolean | number | RegExp | string | null => {
  if (filter === "true") return true;
  if (filter === "false") return false;

  if (isOnlyDigits.test(filter)) return parseInt(filter);
  if (isValidRegex.test(filter)) {
    // it would be faster for regex to read cache earlier and not need to test
    // but only checking cache for valid regex speeds up other cases
    if (filterParseMap.has(filter)) return filterParseMap.get(filter)!;
    const [, regex, flags] = isValidRegex.exec(filter)!;
    try {
      const val = new RegExp(regex, flags);
      filterParseMap.set(filter, val);
      return val;
    } catch (e) {
      // this prevents the immense cost of parsing invalid regex 1000x
      filterParseMap.set(filter, null);
      // this removes the invalid regex from the cache
      setTimeout(() => filterParseMap.delete(filter), 1000);
      // show that error once we finish rendering
      setTimeout(() => {
        toast.error((e as Error).message);
      }, 0);
      return null;
    }
  }
  return filter.toLowerCase();
};

// not in use right now...
const filterValueTransforms = new Map<string, Map<any, any>>([]);

/**
 * @param dataObj the data object to filter based on
 * @param filterObj the details of the filter to apply
 * @returns true if the data object matches the filter
 */
export const testFilter = (
  dataObj: Record<string, any>,
  filterObj: PopulatedFilter
) => {
  const filter = parseFilter(filterObj.value);
  if (filter === null) return false;
  const key = filterObj.key;
  const val = dataObj[key];
  if (filter instanceof RegExp) {
    return filter.test((val ?? "").toString());
  }
  if (typeof filter === "number" || typeof filter === "boolean")
    return val === filter;
  if (typeof filter === "string" && typeof val === "string") {
    const transformedValue = filterValueTransforms.get(key)?.get(val as any);
    if (transformedValue !== undefined) {
      return (
        transformedValue.toLowerCase().includes(filter) ||
        val.toLowerCase().includes(filter)
      );
    }
    return val.toLowerCase().includes(filter);
  }
  return false;
};

// this regex is used to match the filter keys in the url param
export const isParamFilter = /^f_/;

/**
 * Higher order function that returns a function to be used for filter execution
 *
 * If there are not filters, returns undefined
 */
export const executeFilters = (filters: PopulatedFilter[]) => {
  if (filters.length === 0) return undefined;
  return (result: { id: any }) => {
    const dataObj = dataMap.get(result.id)!;
    return !filters.some((filter) => !testFilter(dataObj, filter));
  };
};

export const filterIsValid = (filter: Filter) => {
  if (filter.key === undefined || filter.value === undefined) return false;
  if (filter.key === "") return false;
  if (filter.value === "") return false;
  // at this point the data is not literally missing
  if (!filterMap.has(filter.key)) return false;
  // we now know this could be a valid filter
  // regex on a valid key is valid
  if (isValidRegex.test(filter.value)) return true;
  // if it's a number, it's valid
  if (isOnlyDigits.test(filter.value)) return true;
  // if its a string which is a substring of possible values, it's valid
  const possibleValues = filterMap.get(filter.key)!;
  return possibleValues.some(
    (val) =>
      typeof val === "string" && val.toLowerCase().includes(filter.value!)
  );
};
