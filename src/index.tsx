import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react'

const isObj = (obj: unknown): obj is object => (
  typeof obj === 'object' &&
  obj !== null &&
  !Array.isArray(obj)
)

function deepMerge<T1, T2>(obj1: T1, obj2: T2) {
  if (obj2 === undefined) return obj1 as T1 & T2
  if (!isObj(obj1) || !isObj(obj2)) return obj2 as T1 & T2

  const obj: Record<string, any> = { ...obj1 }
  for (const [key, value] of Object.entries(obj2)) {
    obj[key] = deepMerge(obj[key], value)
  }

  return obj as T1 & T2
}

function useValueRef<T>(value: T) {
  const ref = useRef(value)
  if (ref.current !== value) ref.current = value
  return ref
}

function useMemoValue<T>(value: T) {
  const ref = useRef(value)

  return useMemo(() => {
    if (JSON.stringify(value) !== JSON.stringify(ref.current)) {
      ref.current = value
    }
    return ref.current
  }, [value])
}

export type ApiVariables<T extends Partial<Record<'body' | 'query' | 'body', any>> = {}> = T

interface ApiConfig<APIs> {
  fetcher: <T>(api: APIs[keyof APIs], variables: ApiVariables) => Promise<T>
}

type ApiProviderProps<T> = React.PropsWithChildren<{
  config: ApiConfig<T>
}>

function createProvider<T>(ctx: React.Context<ApiConfig<T>>) {
  return function Provider({ config, children }: ApiProviderProps<T>) {

    return (
      <ctx.Provider value={config}>
        {children}
      </ctx.Provider>
    )
  }
}

interface ApiResult<TData = any, TError = any> {
  loading: boolean
  data: TData | null | undefined
  error: TError | null | undefined
}

function reducer<TData, TError>(state: ApiResult<TData, TError>, action: Partial<ApiResult<TData, TError>>) {
  return {
    ...state,
    ...action
  }
}

const defaultResult: ApiResult = {
  loading: false,
  data: undefined,
  error: undefined
}

export interface UseLazyApiOptions<TData, TError, TVariables> {
  variables?: TVariables
  onFetch?: () => Promise<any>
  onCompleted?: (params: { data: TData | null, error: TError | null }) => Promise<any>
}

function createUseLazyApi<
  T,
  TData extends Record<keyof T, any>,
  TError extends Record<keyof T, any>,
  TVariables extends Record<keyof T, any>
>(ctx: React.Context<ApiConfig<T>>, apis: T) {
  return function useLazyApi<
    K extends keyof T,
    TApiData extends TData[K],
    TApiError extends TError[K],
    TApiVariables extends TVariables[K]
  >(key: K, defaultOpts: UseLazyApiOptions<TApiData, TApiError, TApiVariables> = {}) {
    const defaultOptsRef = useValueRef(defaultOpts)
    const api = apis[key]
    const { fetcher } = useContext(ctx)

    const [result, setResult] = useReducer(reducer as typeof reducer<TApiData, TApiError>, defaultResult)

    const fetch = useCallback(async (opts: Pick<UseLazyApiOptions<TApiData, TApiError, TApiVariables>, 'variables'> = {}) => {
      const {
        onFetch,
        onCompleted,
        variables = {}
      } = deepMerge(defaultOptsRef.current, opts)

      if (onFetch) await onFetch()

      setResult({ loading: true })

      let data = null, error = null
      try {
        data = await fetcher!(api, variables) as TApiData
      } catch (err) {
        error = err as TApiError
      }

      if (onCompleted) await onCompleted({ data, error })

      setResult({ loading: false, data, error })

      return { data, error }
    }, [fetcher, api, setResult])

    return [fetch, { ...result, refetch: fetch }] as const
  }
}

function createUseMutationApi<
  T,
  TData extends Record<keyof T, any>,
  TError extends Record<keyof T, any>,
  TVariables extends Record<keyof T, any>
>(ctx: React.Context<ApiConfig<T>>, apis: T) {
  const useLazyApi = createUseLazyApi<T, TData, TError, TVariables>(ctx, apis)
  return function useMutationApi<
    K extends keyof T,
    TApiData extends TData[K],
    TApiError extends TError[K],
    TApiVariables extends TVariables[K]
  >(key: K, opts: UseLazyApiOptions<TApiData, TApiError, TApiVariables> = {}) {
    return useLazyApi<K, TApiData, TApiError, TApiVariables>(key, opts)
  }
}

export interface UseApiOptions<TData, TError, TVariables> extends UseLazyApiOptions<TData, TError, TVariables> {
  skip?: boolean
}

function createUseApi<
  T,
  TData extends Record<keyof T, any>,
  TError extends Record<keyof T, any>,
  TVariables extends Record<keyof T, any>
>(ctx: React.Context<ApiConfig<T>>, apis: T) {
  const useLazyApi = createUseLazyApi<T, TData, TError, TVariables>(ctx, apis)
  return function useApi<
    K extends keyof T,
    TApiData extends TData[K],
    TApiError extends TError[K],
    TApiVariables extends TVariables[K]
  >(key: K, opts: UseApiOptions<TApiData, TApiError, TApiVariables> = {}) {
    const { skip = false, ...lazyOpts } = opts

    const calledRef = useRef(!skip)
    const loadingRef = useRef(!skip)

    const onFetch = useCallback(async () => {
      calledRef.current = true
      loadingRef.current = true
    }, [])
    const onCompleted = useCallback(async () => {
      loadingRef.current = false
    }, [])
    const [fetch, result] =  useLazyApi<K, TApiData, TApiError, TApiVariables>(key, {
      ...lazyOpts,
      onFetch,
      onCompleted
    })

    const latestVariables = useMemoValue(opts.variables)

    useEffect(() => {
      if (skip) return
      fetch()
    }, [skip, fetch, latestVariables])

    return {
      ...result,
      loading: loadingRef.current,
      called: calledRef.current
    }
  }
}

const missingFetcher = async () => {
  throw new Error('Missing fetcher!')
}

export function createAPIs<
  T,
  TData extends Record<keyof T, any> = any,
  TError extends Record<keyof T, any> = any,
  TVariables extends Record<keyof T, any> = any
>(apis: T) {
  const ctx = createContext<ApiConfig<T>>({
    fetcher: missingFetcher
  })

  return {
    Provider: createProvider(ctx),
    useLazyApi: createUseLazyApi<T, TData, TError, TVariables>(ctx, apis),
    useMutationApi: createUseMutationApi<T, TData, TError, TVariables>(ctx, apis),
    useApi: createUseApi<T, TData, TError, TVariables>(ctx, apis)
  }
}