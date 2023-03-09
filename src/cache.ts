export interface ApiResult<TData = any, TError = any> {
  loading: boolean
  data: TData | null | undefined
  error: TError | null | undefined
}

const defaultResult: ApiResult = {
  loading: false,
  data: undefined,
  error: undefined
}

export class Cache {
  data: Record<string, ApiResult> = {}
  subscriptions: Record<string, (() => void)[]> = {}

  get = <TData, TError>(key: string) => {
    return (this.data[key] || defaultResult) as ApiResult<TData, TError>
  }

  set = <TData, TError>(key: string, value: ApiResult<TData, TError>) => {
    this.data[key] = value
    this.subscriptions[key]?.forEach(callback => callback())
  }

  subscribe = (key: string, callback: () => void) => {
    this.subscriptions[key] ||= []
    if (this.subscriptions[key].indexOf(callback) > -1) return
    this.subscriptions[key].push(callback)
  }

  unsubscribe = (key: string, callback: () => void) => {
    this.subscriptions[key] ||= []
    const idx = this.subscriptions[key].indexOf(callback)
    if (idx > -1) this.subscriptions[key].splice(idx, 1)
  }
}