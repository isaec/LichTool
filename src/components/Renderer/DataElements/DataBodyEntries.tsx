import { DataItem, DataSpell, DataUnion, RawData } from "@src/dataLookup";
import { Component, Show } from "solid-js";
import { RendererStyles, DataGroupRenderer } from "../Renderer";
import { DataGroup, EntryLevels } from "../types";

export const DataBodyEntries: Component<{
  entry?: DataGroup;
  level?: EntryLevels;
}> = (props) => (
  <Show when={props.entry !== undefined}>
    <DataGroupRenderer group={props.entry!} entryLevel={props.level ?? 2} />
  </Show>
);

export const Entries: Component<{
  data: RawData<DataUnion>;
}> = (props) => (
  <RendererStyles>
    <DataBodyEntries entry={props.data.entries} />
    <DataBodyEntries entry={(props.data as DataSpell).entriesHigherLevel} />
    <DataBodyEntries entry={(props.data as DataItem).additionalEntries} />
  </RendererStyles>
);
