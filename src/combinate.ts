// https://codereview.stackexchange.com/questions/7001/generating-all-combinations-of-an-array

/**
 * returns an array with every combination of the keys of the passed array - not every ordering is returned
 */
export const arrayCombinate = <T extends string | number>(array: T[]): Array<Array<T>> => {
  const resultStack: Array<Array<T>> = [[]]

  const len = Math.pow(2, array.length)
  for(let i = 0; i < len; i++) {
    const newArray: T[] = []
    for(let j = 0; j < array.length; j++) {
      if(i & Math.pow(2, j)) {
        newArray.push(array[j])
      }
    }
    if(newArray.length !== 0) resultStack.push(newArray)
  }

  return resultStack;
}

export const combinate = <T extends object>(keys: Array<keyof T>, object: T): T => {
  return object
}