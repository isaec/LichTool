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

const makeBaseObject = <T extends Record<string, value>>(
  shouldRemove: (key: keyof T) => boolean,
  object: T
): Record<keyof T, value> =>
  Object.keys(object).reduce((baseObject, key: keyof T) => {
    if (!shouldRemove(key)) {
      baseObject[key] = object[key];
    }
    return baseObject;
  }, {} as Record<keyof T, any>);

/* returns an array containing every object combination of keys */
export const combinate = <T extends Record<string, any>>(
  keys: Array<keyof T>,
  object: T
): Array<T> => {
  const resultStack: Array<T> = [];

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
    if (Object.keys(newObject).length !== 0) resultStack.push(newObject);
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

const generate = <T extends Record<string, value>>(obj: T) => {
  const resultStack: Record<keyof T, value>[] = [];
  /* iterate the keys of obj, pushing each combination to resultStack */

  return resultStack;
};

// goal api
/*
generate({
  a: some([1, 2, 3]),
  b: optional(10),
})

*/
