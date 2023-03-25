import { useEffect, useLayoutEffect, useMemo, useReducer, useRef } from "react"
import { canUseDOM, deepEqual } from "./utils"
import { Cache } from "./cache"

export function useValueRef<T>(value: T) {
  const ref = useRef(value)
  if (ref.current !== value) ref.current = value
  return ref
}

export function useEnhancedMemo<T>(value: T) {
  const ref = useRef(value)

  return useMemo(() => {
    if (!deepEqual(ref.current, value)) {
      ref.current = value
    }
    return ref.current
  }, [value])
}

const rerenderReducer = (s: number) => s + 1
export function useRerender() {
  const [, rerender] = useReducer(rerenderReducer, 0)
  return rerender
}

export function useInitialize(initialize: () => void) {
  useMemo(initialize, [])
}

export const useEnhancedEffect = canUseDOM ? useLayoutEffect : useEffect

export function useCachedData(key: string, cache: Cache){
  const rerender = useRerender()

  useEnhancedEffect(() => {
    cache.subscribe(key, rerender)
    return () => cache.unsubscribe(key, rerender)
  }, [key])

  return cache.get(key)
}