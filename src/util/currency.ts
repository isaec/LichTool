import { Currency, currencyToCopperMap } from "@src/generalTypes";

/**
 *
 * @param value the value to convert from
 * @param from the currency of {@link value}
 * @param to the currency to convert to
 * @returns the new value in the {@link to} currency as a number
 */
export const convert = (value: number, from: Currency, to: Currency): number =>
  value * (currencyToCopperMap.get(from)! / currencyToCopperMap.get(to)!);

/**
 *
 * @param value the value to convert from
 * @param from the currency of {@link value}
 * @param to the currency to convert to
 * @returns the new value in the {@link to} currency as a ***floored*** number
 */
export const convertFloor = (
  value: number,
  from: Currency,
  to: Currency
): number =>
  Math.floor(
    value * (currencyToCopperMap.get(from)! / currencyToCopperMap.get(to)!)
  );
