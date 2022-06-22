// https://codereview.stackexchange.com/questions/7001/generating-all-combinations-of-an-array

type Value =
  | string
  | number
  | {
      [key: string]: Value;
    }
  | Value[];

const enum CombinationType {
  Array,
  Value,
  ArrayOrValue,
}

interface Combination {
  (): Value[];
  type: CombinationType;
}

interface CombinationKeyValue extends Array<Value> {
  type: CombinationType;
}

const makeCombinationKeyValue = (
  array: Value[],
  type: CombinationType
): CombinationKeyValue => {
  (array as CombinationKeyValue).type = type;
  return array as CombinationKeyValue;
};

const isCombination = (data: Combination | Value): data is Combination =>
  typeof data === "function" && data.type !== undefined;

/**
 * returns an array with every combination of the keys of the passed array - not every ordering is returned
 */
export const arrayCombinate = <T extends Value>(
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
export const combinate = <T extends Record<string, Value>>(
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

const makeCombination = (
  fn: () => ReturnType<Combination>,
  type: CombinationType
): Combination => {
  (fn as Combination).type = type;
  return fn as Combination;
};

const some = (array: Value[]) =>
  makeCombination(() => array, CombinationType.Array);
some.asArrayOrValue = (array: Value[]) =>
  makeCombination(() => array, CombinationType.ArrayOrValue);

export { some };

export const optional = (value: Value): Combination =>
  makeCombination(() => [value], CombinationType.Value);

export const generate = <T extends Record<string, Value | Combination>>(
  object: T
) => {
  const baseObject = makeBaseObject(
    (key) => isCombination(object[key]),
    object
  ) as Partial<Record<keyof T, Value>>;

  return arrayCombinate(
    Object.entries(object).reduce((arr, [key, valueFn]) => {
      if (typeof valueFn === "function") {
        const values = valueFn();

        const objValues = values.reduce((valueObjArray, value) => {
          valueObjArray.push(
            makeCombinationKeyValue([key, value], valueFn.type)
          );
          return valueObjArray;
        }, [] as any);

        return arr.concat(objValues);
      }
      return arr;
    }, [] as Array<[string, Value]>)
  ).reduce((arr, kvArr) => {
    const newObject = { ...baseObject };

    kvArr.forEach((kv) => {
      // @ts-ignore
      console.log(kv.type);
      const [key, value]: [keyof T & string, Value] = kv;
      if (newObject[key] === undefined) {
        newObject[key] = value;
      } else if (Array.isArray(newObject[key])) {
        (newObject[key] as Value[]).push(value);
      } else {
        newObject[key] = [newObject[key]!, value];
      }
    });

    arr.push(newObject);
    return arr;
  }, [] as Array<Partial<Record<keyof T, Value>>>);
};

// goal api
/*
generate({
  a: some([1, 2, 3]),
  b: optional(10),
})

*/
