// https://codereview.stackexchange.com/questions/7001/generating-all-combinations-of-an-array

type value =
  | string
  | number
  | {
      [key: string]: value;
    }
  | Array<value>;

interface Combination {
  (): Array<value>;
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

export const some = (array: Array<value>): Combination => {
  return () => array;
};

export const optional =
  (value: value): Combination =>
  () =>
    [value];

export const generate = <T extends Record<string, value | Combination>>(
  object: T
) => {
  const resultStack: Partial<T>[] = [];

  const baseObject = makeBaseObject(
    (key) => isCombination(object[key]),
    object
  ) as Partial<Record<keyof T, value>>;

  const combinationArray = arrayCombinate(
    Object.entries(object).reduce((arr, [key, valueFn]) => {
      if (typeof valueFn === "function") {
        const values = valueFn();

        const objValues = values.reduce((valueObjArray, value) => {
          valueObjArray.push([key, value]);
          return valueObjArray;
        }, [] as any);

        return [...arr, ...objValues];
      }
      return arr;
    }, [] as Array<[string, value]>)
  ).reduce((arr, kvArr) => {
    const newObject = { ...baseObject };

    kvArr.forEach(([key, value]) => {
      if (newObject[key] === undefined) {
        newObject[key] = value;
      } else if (Array.isArray(newObject[key])) {
        newObject[key].push(value);
      } else {
        newObject[key] = [newObject[key], value];
      }
    });

    arr.push(newObject);
    return arr;
  }, [] as T[]);

  console.log(combinationArray);
};

// goal api
/*
generate({
  a: some([1, 2, 3]),
  b: optional(10),
})

*/
