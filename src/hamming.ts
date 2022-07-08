/**
 * @param a first string to compare
 * @param b second string to compare
 * @returns the number of characters different between {@link a} and {@link b}, treating missing characters as a difference
 */
export const hammingDistance = (a: string, b: string) => {
  let distance = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] !== b[i]) distance++;
  }
  return distance + Math.abs(a.length - b.length);
};

/**
 * a higher order function that makes a function to sort strings by their distance to a function
 * @param from the string to sort from
 * @returns a function that can be used to sort strings by their hamming distance from {@link from}, with the closest string first
 */
export const hammingDistanceFrom = (from: string) => (a: string, b: string) =>
  hammingDistance(from, a) - hammingDistance(from, b);
