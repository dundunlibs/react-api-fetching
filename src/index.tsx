import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react'
import { deepEqual, deepMerge, generateConcurrentFn } from './utils'
import { useValueRef, useEnhancedMemo, useCachedData, useEnhancedEffect, useInitialize } from './hooks'
import { Cache, defaultResult, generateCacheKey, isCached } from './cache'
import type { ApiResult } from './cache'

export { Cache } from './cache'

export { generateConcurrentFn }

export type ApiVariables<T extends Partial<Record<'body' | 'query' | 'body', any>> = {}> = T

interface ApiConfig<APIs> {
  fetcher: (api: APIs[keyof APIs], variables: ApiVariables) => Promise<unknown>
  refetchOnFocus?: boolean
  useFocused?: () => boolean
}

interface ApiContext<APIs> {
  cache: Cache
  config: ApiConfig<APIs>
}

type ApiProviderProps<T> = React.PropsWithChildren<{
  cache?: Cache
  config: ApiConfig<T>
}>

function useDefaultFocused() {
  return true
}

function createProvider<T>(ctx: React.Context<ApiContext<T>>) {
  return function Provider({
    config,
    children,
    cache = new Cache(),
  }: ApiProviderProps<T>) {
    const {
      fetcher,
      refetchOnFocus = true,
      useFocused = useDefaultFocused
    } = config
    const concurrentFetcher = useMemo(() => generateConcurrentFn(fetcher), [fetcher])

    return (
      <ctx.Provider
        value={{
          cache,
          config: {
            ...config,
            useFocused,
            refetchOnFocus,
            fetcher: concurrentFetcher
          }
        }}
      >
        {children}
      </ctx.Provider>
    )
  }
}


function stateReducer<T>(_: T, action: T) {
  return action
}

function partialStateReducer<T extends {}>(s: T, action: Partial<T>) {
  return {
    ...s,
    ...action
  } as T
}

function createUseRevalidate<
  T,
  TData extends Record<keyof T, any>,
  TError extends Record<keyof T, any>,
  TVariables extends Record<keyof T, any>
>(ctx: React.Context<ApiContext<T>>, apis: T) {
  return function useRevalidate() {
    const { cache, config: { fetcher } } = useContext(ctx)

    const revalidate = useCallback(async function <
      K extends keyof T,
      TApiData extends TData[K],
      TApiError extends TError[K],
      TApiVariables extends TVariables[K]
    >(key: K, variables: TApiVariables) {
      const cacheKey = generateCacheKey(key, variables)
      const cacheData = cache.get(cacheKey)

      cache.set(cacheKey, {
        ...cacheData,
        loading: true
      })

      let data = null, error = null
      try {
        data = await fetcher!(apis[key], variables) as TApiData
      } catch (err) {
        error = err as TApiError
      }

      cache.set(cacheKey, {
        loading: false,
        data,
        error
      })

      return { data, error }
    }, [cache, fetcher])

    return revalidate
  }
}

function createUseMutate<
  T,
  TData extends Record<keyof T, any>,
  TError extends Record<keyof T, any>,
  TVariables extends Record<keyof T, any>
>(ctx: React.Context<ApiContext<T>>) {
  return function useMutate() {
    const { cache } = useContext(ctx)

    const mutate = useCallback(function <
      K extends keyof T,
      TApiData extends TData[K],
      TApiVariables extends TVariables[K]
    >(key: K, variables: TApiVariables, callback: (prevData: TApiData | null | undefined) => TApiData | null | undefined) {
      const cacheKey = generateCacheKey(key, variables)
      const cacheData = cache.get(cacheKey) as ApiResult<TApiData, TError[K]>
      const data = callback(cacheData.data)
      cache.set(cacheKey, { ...cacheData, data })
      return data
    }, [cache])

    return mutate
  }
}

interface OnCompletedParams<
  T,
  TData extends Record<keyof T, any>,
  TError extends Record<keyof T, any>,
  TVariables extends Record<keyof T, any>,
  K extends keyof T
> {
  data: TData[K] | null,
  error: TError[K] | null,
  revalidate: <
    X extends keyof T,
    TApiData extends TData[X],
    TApiError extends TError[X],
    TApiVariables extends TVariables[X]
  >(key: X, variables: TApiVariables) => Promise<{
    data: TApiData | null;
    error: TApiError | null;
  }>
  mutate: <
    X extends keyof T,
    TApiData extends TData[X],
    TApiVariables extends TVariables[X]
  >(key: X, variables: TApiVariables, callback: (prevData: TApiData | null | undefined) => TApiData | null | undefined) => TApiData | null | undefined
}

export interface UseLazyApiOptions<
  T,
  TData extends Record<keyof T, any>,
  TError extends Record<keyof T, any>,
  TVariables extends Record<keyof T, any>,
  K extends keyof T
> {
  cached?: boolean
  refetchOnFocus?: boolean
  variables?: TVariables
  onFetch?: () => any
  onCompleted?: (params: OnCompletedParams<T, TData, TError, TVariables, K>) => any
}

function createUseLazyApi<
  T,
  TData extends Record<keyof T, any>,
  TError extends Record<keyof T, any>,
  TVariables extends Record<keyof T, any>
>(ctx: React.Context<ApiContext<T>>, apis: T) {
  const useRevalidate = createUseRevalidate<T, TData, TError, TVariables>(ctx, apis)
  const useMutate = createUseMutate<T, TData, TError, TVariables>(ctx)

  return function useLazyApi<
    K extends keyof T,
    TApiData extends TData[K],
    TApiError extends TError[K],
    TApiVariables extends TVariables[K],
  >(key: K, defaultOpts: UseLazyApiOptions<T, TData, TError, TVariables, K> = {}) {
    const revalidate = useRevalidate()
    const mutate = useMutate()
    const fetchedRef = useRef(false)
    const defaultOptsRef = useValueRef(defaultOpts)
    const {
      cache,
      config: { fetcher, refetchOnFocus, useFocused }
    } = useContext(ctx)
    const [variables, setVariables] = useReducer(stateReducer as typeof stateReducer<TApiVariables>, (defaultOpts.variables || {}) as TApiVariables)
    const variablesRef = useValueRef(variables)
    const cacheKey = useMemo(() => generateCacheKey(key, variables), [key, variables])
    const cachedResult = useCachedData(cacheKey, cache) as ApiResult<TApiData, TApiError>
    const [localResult, setLocalResult] = useReducer(partialStateReducer as typeof partialStateReducer<ApiResult<TApiData, TApiError>>, defaultResult)
    const prevResultRef = useRef({})
    const prevVariablesRef = useRef<TApiVariables>()
    const cachedRef = useRef(defaultOpts.cached ?? true)

    // update cacheKey when default variables changed
    const defaultVariables = useEnhancedMemo(defaultOpts.variables)
    useEnhancedEffect(() => {
      if (deepEqual(variablesRef.current, defaultVariables)) return
      setVariables((defaultVariables || {}) as TApiVariables)
    }, [defaultVariables, setVariables])

    const fetch = useCallback(async (opts: Pick<UseLazyApiOptions<T, TData, TError, TVariables, K>, 'variables'> = {}) => {
      const api = apis[key]
      const {
        onFetch,
        onCompleted,
        cached = true,
        variables = {}
      } = deepMerge(defaultOptsRef.current, opts)
      const cacheKey = generateCacheKey(key, variables)
      const cacheData = cache.get(cacheKey)

      if (onFetch) await onFetch()

      cachedRef.current = cached

      if (cached) {
        cache.set(cacheKey, {
          ...cacheData,
          loading: true
        })
      } else {
        setLocalResult({ loading: true })
      }

      // if cached is true, we need to set new variables so that `useCachedData` can load data from the new key
      if (cached && !deepEqual(variables, variablesRef.current)) {
        setVariables(variables as TApiVariables)
      }

      let data = null, error = null
      try {
        data = await fetcher!(api, variables) as TApiData
      } catch (err) {
        error = err as TApiError
      }

      if (onCompleted) await onCompleted({ data, error, revalidate, mutate })

      fetchedRef.current = true
      prevResultRef.current = { data, error }
      prevVariablesRef.current = variables as TApiVariables

      if (cached) {
        cache.set(cacheKey, {
          loading: false,
          data,
          error
        })
      } else {
        setLocalResult({
          loading: false,
          data,
          error
        })
      }

      return { data, error }
    }, [key, cache, fetcher, setVariables, setLocalResult, revalidate, mutate])

    const refetch = useCallback(() => fetch({ variables: prevVariablesRef.current }), [fetch])

    /**
     * automatically refetch on focus
     */
    const focused = useFocused!()
    const refetchOnFocusRef = useRef(defaultOpts.refetchOnFocus ?? refetchOnFocus)
    useEnhancedEffect(() => {
      if (focused && refetchOnFocusRef.current && fetchedRef.current) refetch()
    }, [focused, refetch])

    return [fetch, {
      ...(cachedRef.current ? {
        ...cachedResult,
        // when we changed variables, the cached result might be empty, but we want to keep showing the previous result
        ...(!isCached(cacheKey, cache) && prevResultRef.current),
      } : localResult),
      refetch
    }] as const
  }
}

function createUseMutationApi<
  T,
  TData extends Record<keyof T, any>,
  TError extends Record<keyof T, any>,
  TVariables extends Record<keyof T, any>
>(ctx: React.Context<ApiContext<T>>, apis: T) {
  const useLazyApi = createUseLazyApi<T, TData, TError, TVariables>(ctx, apis)
  return function useMutationApi<
    K extends keyof T,
    TApiData extends TData[K],
    TApiError extends TError[K],
    TApiVariables extends TVariables[K]
  >(key: K, opts: UseLazyApiOptions<T, TData, TError, TVariables, K> = {}) {
    return useLazyApi<K, TApiData, TApiError, TApiVariables>(key, {
      ...opts,
      cached: false,
      refetchOnFocus: false
    })
  }
}

export interface UseApiOptions<
  T,
  TData extends Record<keyof T, any>,
  TError extends Record<keyof T, any>,
  TVariables extends Record<keyof T, any>,
  K extends keyof T
> extends UseLazyApiOptions<T, TData, TError, TVariables, K> {
  skip?: boolean
  force?: boolean
}

function createUseApi<
  T,
  TData extends Record<keyof T, any>,
  TError extends Record<keyof T, any>,
  TVariables extends Record<keyof T, any>
>(ctx: React.Context<ApiContext<T>>, apis: T) {
  const useLazyApi = createUseLazyApi<T, TData, TError, TVariables>(ctx, apis)
  return function useApi<
    K extends keyof T,
    TApiData extends TData[K],
    TApiError extends TError[K],
    TApiVariables extends TVariables[K]
  >(key: K, opts: UseApiOptions<T, TData, TError, TVariables, K> = {}) {
    const { cache } = useContext(ctx)
    const optsRef = useValueRef(opts)
    const {
      skip = false,
      force = false,
      ...lazyOpts
    } = opts

    const latestVariables = useEnhancedMemo(opts.variables)
    const cacheKey = useMemo(() => generateCacheKey(key, latestVariables), [key, latestVariables])
    const cached = useMemo(() => isCached(cacheKey, cache), [cacheKey, cache])

    const calledRef = useRef(!skip || cached)

    // set loading: true in first render
    useInitialize(() => {
      if (skip || cached) return
      cache.initialize(cacheKey, { ...defaultResult, loading: true })
    })

    const onFetch = useCallback(async () => {
      calledRef.current = true
      if (optsRef.current.onFetch) await optsRef.current.onFetch()
    }, [])

    const [fetch, result] = useLazyApi<K, TApiData, TApiError, TApiVariables>(key, {
      ...lazyOpts,
      onFetch
    })

    useEffect(() => {
      if (skip) return
      if (!force && isCached(cacheKey, cache)) return
      fetch()
    }, [skip, force, fetch, key, cacheKey, cache])

    return {
      ...result,
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
  const ctx = createContext<ApiContext<T>>({
    cache: new Cache(),
    config: {
      fetcher: missingFetcher
    },
  })

  return {
    Provider: createProvider(ctx),
    useLazyApi: createUseLazyApi<T, TData, TError, TVariables>(ctx, apis),
    useMutationApi: createUseMutationApi<T, TData, TError, TVariables>(ctx, apis),
    useApi: createUseApi<T, TData, TError, TVariables>(ctx, apis),
    useRevalidate: createUseRevalidate<T, TData, TError, TVariables>(ctx, apis)
  }
}