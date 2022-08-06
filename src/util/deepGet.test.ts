import deepGet from "./deepGet";
const obj = { a: { b: { c: 1, cAlt: "other str" }, bAlt: "str" } };
it.each([
  [obj, "a.b.c", 1],
  [obj, "a.b.cAlt", "other str"],
  [obj, "a.b.d", undefined, undefined],
  [obj, "a.b.d", "uh oh", "uh oh"],
  [obj, "a.bAlt", "str"],
])("deepGet(%j, %s) === %j", (obj, path, expected, fallback?: any) => {
  expect(deepGet(obj, path, fallback)).toBe(expected);
});
