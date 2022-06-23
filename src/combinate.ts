// https://codereview.stackexchange.com/questions/7001/generating-all-combinations-of-an-array

type Value =
  | string
  | number
  | {
      [key: string]: Value;
    }
  | Value[];

class Combination {
  values: () => Array<Value | null>;
  constructor(values: () => ReturnType<Combination["values"]>) {
    this.values = values;
  }
}

type CombinationKeyValues<T> = [keyof T & string, Array<Value | null>];

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

export const some = (array: Value[]) =>
  new Combination(() => arrayCombinate(array));

export const optional = (value: Value): Combination =>
  new Combination(() => [value, null]);

export const one = (values: Value[]) => new Combination(() => values);

export const generate = <T extends Record<string, Value>>(
  object: Record<keyof T, Combination | Value>
): T[] => {
  const baseObject = makeBaseObject(
    (key) => isCombination(object[key]),
    object
  ) as Partial<Record<keyof T, Value>>;

  const objectCombinations = Object.entries(object).reduce((array, [k, v]) => {
    if (isCombination(v)) {
      array.push([k, v.values()]);
    }
    return array;
  }, [] as Array<CombinationKeyValues<T>>);

  console.log(objectCombinations);

  let combos: T[] = [];

  // iterate keys
  //   make scratch array
  //   iterate the values of that key
  //     iterate every old combo
  //       add this new key to that combo
  //       add new combo to scratch
  //   set combos to scratch

  for (let i = 0; i < objectCombinations.length; i++) {
    const [key, values] = objectCombinations[i];
    const scratch: T[] = [];
    for (let j = 0; j < values.length; j++) {
      const value = values[j];
      for (let k = 0; k < (combos.length || 1); k++) {
        const combo = { ...combos[k] };
        if (value !== null) combo[key] = value;
        scratch.push(combo);
      }
    }
    combos = scratch;
  }

  return combos;
};

// goal api
/*
generate({
  a: some([1, 2, 3]),
  b: optional(10),
})

*/
