import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef } from 'react'
import { deepEqual, deepMerge, generateConcurrentFn } from './utils'
import { useValueRef, useEnhancedMemo, useCachedData } from './hooks'
import { ApiResult, Cache, defaultResult, generateCacheKey, isCached } from './cache'
export { Cache } from './cache'

export type ApiVariables<T extends Partial<Record<'body' | 'query' | 'body', any>> = {}> = T

interface ApiConfig<APIs> {
  fetcher: (api: APIs[keyof APIs], variables: ApiVariables) => Promise<unknown>
}

interface ApiContext<APIs> {
  cache: Cache
  config: ApiConfig<APIs>
}

type ApiProviderProps<T> = React.PropsWithChildren<{
  cache?: Cache
  config: ApiConfig<T>
}>

function createProvider<T>(ctx: React.Context<ApiContext<T>>) {
  return function Provider({
    config,
    children,
    cache = new Cache(),
  }: ApiProviderProps<T>) {
    const { fetcher } = config
    const concurrentFetcher = useMemo(() => generateConcurrentFn(fetcher), [fetcher])

    return (
      <ctx.Provider
        value={{
          cache,
          config: {
            ...config,
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

export interface UseLazyApiOptions<TData, TError, TVariables> {
  cached?: boolean
  variables?: TVariables
  onFetch?: () => Promise<any>
  onCompleted?: (params: { data: TData | null, error: TError | null }) => Promise<any>
}

function createUseLazyApi<
  T,
  TData extends Record<keyof T, any>,
  TError extends Record<keyof T, any>,
  TVariables extends Record<keyof T, any>
>(ctx: React.Context<ApiContext<T>>, apis: T) {
  return function useLazyApi<
    K extends keyof T,
    TApiData extends TData[K],
    TApiError extends TError[K],
    TApiVariables extends TVariables[K]
  >(key: K, defaultOpts: UseLazyApiOptions<TApiData, TApiError, TApiVariables> = {}) {
    const defaultOptsRef = useValueRef(defaultOpts)
    const {
      cache,
      config: { fetcher }
    } = useContext(ctx)
    const [variables, setVariables] = useReducer(stateReducer as typeof stateReducer<TApiVariables>, (defaultOpts.variables || {}) as TApiVariables)
    const variablesRef = useValueRef(variables)
    const cacheKey = useMemo(() => generateCacheKey(key, variables), [key, variables])
    const cachedResult = useCachedData(cacheKey, cache) as ApiResult<TApiData, TApiError>
    const [localResult, setLocalResult] = useReducer(partialStateReducer as typeof partialStateReducer<ApiResult<TApiData, TApiError>>, defaultResult)
    const prevResultRef = useRef({})
    const cachedRef = useRef(defaultOpts.cached ?? true)

    const fetch = useCallback(async (opts: Pick<UseLazyApiOptions<TApiData, TApiError, TApiVariables>, 'variables'> = {}) => {
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

      if (onCompleted) await onCompleted({ data, error })

      prevResultRef.current = { data, error }

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
    }, [key, cache, fetcher, setVariables, setLocalResult])

    return [fetch, {
      ...(cachedRef.current ? {
        ...cachedResult,
        // when we changed variables, the cached result might be empty, but we want to keep showing the previous result
        ...(!isCached(cacheKey, cache) && prevResultRef.current),
      } : localResult),
      refetch: fetch
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
  >(key: K, opts: UseLazyApiOptions<TApiData, TApiError, TApiVariables> = {}) {
    return useLazyApi<K, TApiData, TApiError, TApiVariables>(key, {
      ...opts,
      cached: false
    })
  }
}

export interface UseApiOptions<TData, TError, TVariables> extends UseLazyApiOptions<TData, TError, TVariables> {
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
  >(key: K, opts: UseApiOptions<TApiData, TApiError, TApiVariables> = {}) {
    const { cache } = useContext(ctx)
    const {
      skip = false,
      force = false,
      ...lazyOpts
    } = opts

    const latestVariables = useEnhancedMemo(opts.variables)
    const cacheKey = useMemo(() => generateCacheKey(key, latestVariables), [key, latestVariables])
    const cached = useMemo(() => isCached(cacheKey, cache), [cacheKey, cache])

    const calledRef = useRef(!skip || cached)
    const loadingRef = useRef(!skip && !cached)

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

    useEffect(() => {
      if (skip) return
      if (!force && isCached(cacheKey, cache)) return
      fetch()
    }, [skip, force, fetch, key, cacheKey, cache])

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
    useApi: createUseApi<T, TData, TError, TVariables>(ctx, apis)
  }
}