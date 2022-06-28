import {
  Distances,
  Levels,
  Ranges,
  SchoolAbbreviations,
  Sources,
} from "@components/generalTypes";

export type SectionData = { type: "section"; name: string; entries: DataGroup };
export const listStyles = new Set(["list-hang", "list-no-bullets"]);
export type ListData = {
  type: "list";
  items: Data[];
  columns?: number;
  style?: string;
  name?: string;
};
export type InsetData = { type: "inset"; name: string; entries: Data };
export type InsetReadaloudData = {
  type: "insetReadaloud";
  name: string;
  entries: Data;
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
export type BonusSpeed = {
  type: "bonusSpeed";
  value: number;
};
/** the data of a spell */
export type DataSpell = {
  name: string;
  level: Levels;
  school: SchoolAbbreviations;
  time: { number: number; unit: "action" }[];
  range: { type: Ranges; distance: { type: Distances; amount: number } };
  components: { v: boolean; s: boolean; m: string };
  duration: [{ type: "instant" }];
  entries: DataGroup;
  source: Sources;
  page: number;
};
/** the DataNode containing the data of a spell */
export type DataSpellData = {
  type: "dataSpell";
  dataSpell: DataSpell;
};
export type DataNode =
  | SectionData
  | ListData
  | InsetData
  | InsetReadaloudData
  | QuoteData
  | BonusData
  | BonusSpeed
  | DataSpellData;
export const isDataNode = (data: Data | object): data is DataNode =>
  typeof (data as DataNode).type === "string";
export type DataGroup = Array<DataNode | string>;
export type Data = string | DataNode | DataGroup;
