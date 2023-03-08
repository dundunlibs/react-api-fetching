import { useMemo, useRef } from "react"

export function useValueRef<T>(value: T) {
  const ref = useRef(value)
  if (ref.current !== value) ref.current = value
  return ref
}

export function useEnhancedMemo<T>(value: T) {
  const ref = useRef(value)

  return useMemo(() => {
    if (JSON.stringify(value) !== JSON.stringify(ref.current)) {
      ref.current = value
    }
    return ref.current
  }, [value])
}