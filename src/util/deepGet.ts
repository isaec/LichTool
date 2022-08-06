type Result<T> = DeepObject<T> | T;
type DeepObject<T> = {
  [key: string]: Result<T>;
};

export default function deepGet<T, K>(
  obj: DeepObject<T>,
  path: string,
  fallback: K
): Result<T> | K {
  const keyStack = path.split(".").reverse();
  let pointer: Result<T> = obj;
  while (keyStack.length > 0) {
    const key = keyStack.pop()!;
    if (typeof pointer !== "object" || !(key in pointer)) return fallback;
    pointer = (pointer as DeepObject<T>)[key];
  }
  return pointer;
}
