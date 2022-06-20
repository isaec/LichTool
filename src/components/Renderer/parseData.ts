import { Data, isDataNode } from "./types";

/** internal data parser, handling data in many format types */
export const parseData = (data: object | string): Data => {
  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch (e) {
      // this will test if its a string unquoted, or actually failing validation
      return JSON.parse(`"${data}"`);
    }
  }
  if (isDataNode(data)) {
    return data;
  }

  throw new Error("incomprehensible data - not a string or legal object");
};

export default parseData