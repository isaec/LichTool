import { Component } from "solid-js";

export const SearchResult: Component<{ id: string }> = (props) => (
  <p>{props.id}</p>
);
export const searchResultFn = (result: { id: string }) => (
  <SearchResult id={result.id} />
);
