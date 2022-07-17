/**
 * determine if a series of arguments are all defined
 * @param args the values to check for undefined
 * @returns true if none of the values are undefined
 */
export const allDefined = (...args: any[]) =>
  args.every((arg) => arg !== undefined);
