// https://codereview.stackexchange.com/questions/7001/generating-all-combinations-of-an-array

type Value =
  | string
  | number
  | {
      [key: string]: Value;
    }
  | Value[];

const enum CombinationType {
  Array = "Array",
  Value = "Value",
  ArrayOrValue = "ArrayOrValue",
}

class Combination {
  type: CombinationType;
  values: () => Value[];
  constructor(values: () => Value[], type: CombinationType) {
    this.type = type;
    this.values = values;
  }
}

interface CombinationKeyValue<T> extends Array<Value> {
  0: keyof T & string;
  1: Value;
  length: 2;
  type: CombinationType;
}

const makeCombinationKeyValue = <T>(
  array: Value[],
  type: CombinationType
): CombinationKeyValue<T> => {
  (array as CombinationKeyValue<T>).type = type;
  return array as CombinationKeyValue<T>;
};

const isCombination = (data: Combination | Value): data is Combination =>
  data instanceof Combination;

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

const keyValueCombinate = <T>(
  kvArray: CombinationKeyValue<T>[]
): Array<Array<CombinationKeyValue<T>>> => {
  return arrayCombinate(kvArray);
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

const some = (array: Value[]) =>
  new Combination(() => array, CombinationType.Array);
some.asArrayOrValue = (array: Value[]) =>
  new Combination(() => array, CombinationType.ArrayOrValue);
export { some };

export const optional = (value: Value): Combination =>
  new Combination(() => [value], CombinationType.Value);

export const one = (values: Value[]) =>
  new Combination(() => values, CombinationType.Value);

export const generate = <T extends Record<string, Value>>(
  object: Record<keyof T, Combination | Value>
): T[] => {
  const baseObject = makeBaseObject(
    (key) => isCombination(object[key]),
    object
  ) as Partial<Record<keyof T, Value>>;

  return arrayCombinate(
    Object.entries(object).reduce((arr, [key, combination]) => {
      if (isCombination(combination)) {
        const values: ReturnType<typeof combination["values"]> =
          combination.values();

        const objValues = values.reduce(
          (valueObjArray: CombinationKeyValue<T>[], value) => {
            valueObjArray.push(
              makeCombinationKeyValue([key, value], combination.type)
            );
            return valueObjArray;
          },
          [] as CombinationKeyValue<T>[]
        );

        return arr.concat(objValues);
      }
      return arr;
    }, [] as Array<CombinationKeyValue<T>>)
  ).reduce((arr, kvArr) => {
    const newObject = { ...baseObject };
    kvArr.forEach((kv) => {
      const [key, value] = kv;
      switch (kv.type) {
        case CombinationType.Array:
          if (newObject[key] === undefined) newObject[key] = [value];
          else (newObject[key] as Value[]).push(value);
          break;
        case CombinationType.Value:
          newObject[key] = value;
          break;
        case CombinationType.ArrayOrValue:
          if (newObject[key] === undefined) newObject[key] = value;
          else if (Array.isArray(newObject[key]))
            (newObject[key] as Value[]).push(value);
          else (newObject[key] as Value[]) = [newObject[key]!, value];
          break;
      }
    });

    arr.push(
      newObject as T /* this assertion could be wrong, but it lets combinate return good types */
    );
    return arr;
  }, [] as T[]);
};

// goal api
/*
generate({
  a: some([1, 2, 3]),
  b: optional(10),
})

*/
