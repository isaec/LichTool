import deepGet from "./deepGet";
const obj = { a: { b: { c: 1, cAlt: "other str" }, bAlt: "str" } };
it.each([
  [obj, "a.b.c", null, 1],
  [obj, "a.b.cAlt", null, "other str"],
  [obj, "a.b.d", undefined, undefined],
  [obj, "a.b.d", "uh oh", "uh oh"],
  [obj, "a.bAlt", null, "str"],
  [obj, "a.bAlt.c", null, null],
  [obj, "a", null, obj.a],
])("deepGet(%j, %s, %j) === %j", (o, path, fallback, expected) => {
  expect(deepGet(o, path, fallback)).toBe(expected);
});
