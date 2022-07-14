import {
  Distances,
  Durations,
  Levels,
  Ranges,
  SchoolAbbreviations,
  Sources,
  TimeUnits,
} from "@src/generalTypes";
import { RawDataSpell } from "@src/dataLookup";

export type EntryLevels = 0 | 1 | 2;

export type SectionData = { type: "section"; name: string; entries: DataGroup };
export const listStyles = new Set(["list-hang", "list-no-bullets"]);
export type ListData = {
  type: "list";
  items: Data[];
  columns?: number;
  style?: string;
  name?: string;
};
export type InsetData = { type: "inset"; name: string; entries: DataGroup };
export type InsetReadaloudData = {
  type: "insetReadaloud";
  name: string;
  entries: DataGroup;
};
export type VariantData = {
  type: "variant";
  name: string;
  entries: DataGroup;
};
export type VariantSubData = {
  type: "variantSub";
  name: string;
  entries: DataGroup;
};
export type QuoteData = {
  type: "quote";
  entries: DataGroup;
  by?: string;
  from?: string;
};
export type BonusData = {
  type: "bonus";
  value: number;
};
export type BonusSpeedData = {
  type: "bonusSpeed";
  value: number;
};
export type EntriesData = {
  type: "entries";
  name?: string;
  entries: DataGroup;
};

/** the DataNode containing the data of a spell */
export type DataSpellData = {
  type: "dataSpell";
  dataSpell: RawDataSpell;
};
export type DataNode =
  | SectionData
  | ListData
  | InsetData
  | InsetReadaloudData
  | VariantData
  | VariantSubData
  | QuoteData
  | BonusData
  | BonusSpeedData
  | EntriesData
  | DataSpellData;
export const isDataNode = (data: Data | object): data is DataNode =>
  typeof (data as DataNode).type === "string";
export type DataGroup = Array<DataNode | string>;
export type Data = string | DataNode | DataGroup;
