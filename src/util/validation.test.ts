import { allDefined } from "./validation";

describe("allDefined", () => {
  it.each([
    [[undefined, undefined], false],
    [[true, 0], true],
    [[true, 1], true],
    [[true, "string"], true],
    [[true, {}, []], true],
    [[true, [], {}, null], true],
    [[true, [], {}, undefined], false],
  ])("given %p, returns %p", (args, expected) => {
    expect(allDefined(...args)).toBe(expected);
  });
});
