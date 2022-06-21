// https://codereview.stackexchange.com/questions/7001/generating-all-combinations-of-an-array

/**
 * returns an array with every combination of the keys of the passed array - not every ordering is returned
 */
export const arrayCombinate = <T extends string | number>(
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

/* returns an array containing every object combination of keys*/
export const combinate = <T extends object>(
  keys: Array<keyof T & string>,
  object: T
): Array<T> => {
  const resultStack: Array<T> = [];

  // object with the keys not present in keys array
  const baseObject = Object.keys(object).reduce((acc, key) => {
    if (!keys.includes(key)) {
      acc[key] = object[key];
    }
    return acc;
  }, {} as T);

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
