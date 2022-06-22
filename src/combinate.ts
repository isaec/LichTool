// https://codereview.stackexchange.com/questions/7001/generating-all-combinations-of-an-array

type Value =
  | string
  | number
  | {
      [key: string]: Value;
    }
  | Value[];

class Combination {
  values: () => Value[];
  constructor(values: () => Value[]) {
    this.values = values;
  }
}

type CombinationKeyValue<T> = [keyof T & string, Value];

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

const some = (array: Value[]) => new Combination(() => array);
some.asArrayOrValue = (array: Value[]) => new Combination(() => array);
export { some };

export const optional = (value: Value): Combination =>
  new Combination(() => [value]);

export const one = (values: Value[]) => new Combination(() => values);

export const generate = <T extends Record<string, Value>>(
  object: Record<keyof T, Combination | Value>
): T[] => {
  const baseObject = makeBaseObject(
    (key) => isCombination(object[key]),
    object
  ) as Partial<Record<keyof T, Value>>;
};

// goal api
/*
generate({
  a: some([1, 2, 3]),
  b: optional(10),
})

*/
