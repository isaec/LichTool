// https://codereview.stackexchange.com/questions/7001/generating-all-combinations-of-an-array

const none = () => null;
const isNone = (fn: Function): fn is typeof none => fn() === null;

type value =
  | string
  | number
  | {
      [key: string]: value;
    }
  | Array<value>;

interface Combination {
  (): Array<value | typeof none>;
}
const isCombination = (data: Combination | value): data is Combination =>
  typeof data === "function";

/**
 * returns an array with every combination of the keys of the passed array - not every ordering is returned
 */
export const arrayCombinate = <T extends value>(
  array: T[]
): Array<Array<T>> => {
  const resultStack: Array<Array<T>> = [[]];

  const len = Math.pow(2, array.length);
  for (let i = 0; i < len; i++) {
    const newArray: T[] = [];
    for (let j = 0; j < array.length; j++) {
      if (i & Math.pow(2, j)) {
        newArray.push(array[j]);
      }
    }
    if (newArray.length !== 0) resultStack.push(newArray);
  }

  return resultStack;
};

const makeBaseObject = <T>(
  shouldRemove: (key: keyof typeof object) => boolean,
  object: Record<string, T>
) =>
  Object.keys(object).reduce((baseObject, key: keyof typeof object) => {
    if (!shouldRemove(key)) {
      baseObject[key] = object[key];
    }
    return baseObject;
  }, {} as Partial<typeof object>);

/* returns an array containing every object combination of keys */
export const combinate = <T extends Record<string, value>>(
  keys: Array<keyof T & string>,
  object: T
): Array<T> => {
  const resultStack: T[] = [];

  // object with the keys not present in keys array
  const baseObject = makeBaseObject((key) => keys.includes(key), object);

  const len = Math.pow(2, keys.length);
  for (let i = 0; i < len; i++) {
    const newObject = { ...baseObject };
    for (let j = 0; j < keys.length; j++) {
      if (i & Math.pow(2, j)) {
        newObject[keys[j]] = object[keys[j]];
      }
    }
    if (Object.keys(newObject).length !== 0) resultStack.push(newObject as T);
  }

  return resultStack;
};

const some = (array: Array<value>): Combination => {
  return () => arrayCombinate(array);
};

const optional =
  (value: value): Combination =>
  () =>
    [value, none];

const generate = <T extends Record<string, value | Combination>>(object: T) => {
  const resultStack: Partial<T>[] = [];

  const baseObject = makeBaseObject(
    (key) => isCombination(object[key]),
    object
  ) as Partial<Record<keyof T, value>>;

  const combinationObject = Object.entries(object).reduce(
    (obj, [key, value]) => {
      if (typeof value === "function") {
        obj[key] = value;
      }
      return obj;
    },
    {} as Record<string, Combination>
  );

  return resultStack;
};

// goal api
/*
generate({
  a: some([1, 2, 3]),
  b: optional(10),
})

*/
