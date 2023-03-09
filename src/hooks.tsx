import { useMemo, useReducer, useRef } from "react"
import { deepEqual } from "./utils"

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