import { Currency, currencyToCopperMap } from "@src/generalTypes";

export const convert = (value: number, from: Currency, to: Currency): number =>
  value * (currencyToCopperMap.get(from)! / currencyToCopperMap.get(to)!);
