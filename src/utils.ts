export const canUseDOM = !!(
  typeof window !== 'undefined' &&
  window.document &&
  window.document.createElement
)

const isObj = (obj: unknown): obj is object => (
  typeof obj === 'object' &&
  obj !== null &&
  !Array.isArray(obj)
)

export function deepMerge<T1, T2>(obj1: T1, obj2: T2) {
  if (!isObj(obj1) || !isObj(obj2)) return obj2 as T1 & T2

  const obj: Record<string, any> = { ...obj1 }
  for (const [key, value] of Object.entries(obj2)) {
    obj[key] = deepMerge(obj[key], value)
  }

  return obj as T1 & T2
}

export function deepEqual(obj1: any, obj2: any): boolean {
  if (typeof obj1 !== typeof obj2) return false

  if (isObj(obj1) && isObj(obj2)) {
    if (Object.keys(obj1).length !== Object.keys(obj2).length) return false

    for (const [key, value] of Object.entries(obj1)) {
      if (key in obj2) {
        const result = deepEqual(value, obj2[key as keyof typeof obj2])
        if (!result) return false
      } else {
        return false
      }
    }

    return true
  } else if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return false
    obj1.forEach((v, i) => {
      const result = deepEqual(v, obj2[i])
      if (!result) return false
    })
    return true
  } else {
    return obj1 === obj2
  }
}

export function generateConcurrentFn<T extends (...args: any) => any>(fn: T) {
  const subscriptions: Record<string, {
    resolve: (value: unknown) => void
    reject: (reason: unknown) => void
  }[]> = {}

  return (...args: Parameters<T>) => new Promise(async (resolve, reject) => {
    const key = JSON.stringify(args)
    if (!subscriptions[key]) {
      subscriptions[key] = []
    }
    const isEmpty = subscriptions[key].length === 0

    subscriptions[key].push({ reject, resolve })

    if (isEmpty) {
      try {
        const data = await fn(...args as any)
        while(subscriptions[key].length > 0) {
          const s = subscriptions[key].pop()
          s?.resolve(data)
        }
      } catch(error) {
        while(subscriptions[key].length > 0) {
          const s = subscriptions[key].pop()
          s?.reject(error)
        }
      }
    }
  }) as ReturnType<T>
}