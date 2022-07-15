import { extractTypeFromUrl } from "@util/formatter";

type Result = { id: string };

export type ResultsGroup = {
  type: string;
  results: Result[];
};

export const groupResults = (results: Result[]): ResultsGroup[] => {
  const ret = [];
  let lastType = "";
  for (let i = 0; i < results.length; i++) {
    const type = extractTypeFromUrl(results[i].id);
    if (type !== lastType) {
      ret.push({
        type: type,
        results: [results[i]],
      });
      lastType = type;
    } else {
      ret[ret.length - 1].results.push(results[i]);
    }
  }
  return ret;
};
