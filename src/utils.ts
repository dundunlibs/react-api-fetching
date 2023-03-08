const isObj = (obj: unknown): obj is object => (
  typeof obj === 'object' &&
  obj !== null &&
  !Array.isArray(obj)
)

export function deepMerge<T1, T2>(obj1: T1, obj2: T2) {
  if (obj2 === undefined) return obj1 as T1 & T2
  if (!isObj(obj1) || !isObj(obj2)) return obj2 as T1 & T2

  const obj: Record<string, any> = { ...obj1 }
  for (const [key, value] of Object.entries(obj2)) {
    obj[key] = deepMerge(obj[key], value)
  }

  return obj as T1 & T2
}