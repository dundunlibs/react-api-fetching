import { waitFor } from '@testing-library/react'
import { fetch, Api, renderHook, resetCache } from '../test-utils'
import type { UseApiOptions } from '..'

describe('useApi', () => {
  beforeEach(() => {
    resetCache()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('automatically fetch data', async () => {
    const { result } = renderHook(() => Api.useApi('USERS'))

    expect(result.current.called).toBeTruthy()
    expect(result.current.loading).toBeTruthy()
    expect(result.current.data).toBeUndefined()

    await waitFor(() => new Promise(r => setTimeout(r, 500)))

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(result.current.loading).toBeFalsy()
    expect(result.current.data).toEqual([
      {
        id: 1,
        name: 'Foo'
      },
      {
        id: 2,
        name: 'Bar'
      }
    ])
  })

  it("don't fetch data as default if skip is true", async () => {
    const { result, rerender } = renderHook((opts: UseApiOptions<any, any, any>) => Api.useApi('USERS', opts), {
      initialProps: { skip: true }
    })

    await waitFor(() => new Promise(r => setTimeout(r, 100)))

    expect(result.current.called).toBeFalsy()
    expect(result.current.loading).toBeFalsy()
    expect(result.current.data).toBeUndefined()
    expect(fetch).not.toHaveBeenCalled()

    rerender({ skip: false })

    await waitFor(() => new Promise(r => setTimeout(r, 10)))

    expect(result.current.called).toBeTruthy()
    expect(result.current.loading).toBeTruthy()
    expect(result.current.data).toBeUndefined()

    await waitFor(() => new Promise(r => setTimeout(r, 500)))

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(result.current.loading).toBeFalsy()
    expect(result.current.data).not.toBeUndefined()
  })

  it("automatically refetch if variables changed", async () => {
    const { result, rerender } = renderHook((opts: UseApiOptions<any, any, any>) => Api.useApi('USERS', opts), {
      initialProps: {
        variables: {
          query: { limit: 10 }
        }
      }
    })

    await waitFor(() => new Promise(r => setTimeout(r, 10)))

    expect(fetch).toHaveBeenLastCalledWith('/users', { query: { limit: 10 }})
    expect(result.current.loading).toBeTruthy()
    expect(result.current.data).toBeUndefined()

    await waitFor(() => new Promise(r => setTimeout(r, 500)))

    expect(result.current.loading).toBeFalsy()
    expect(result.current.data).not.toBeUndefined()

    const latestData = result.current.data

    rerender({ variables: { query: { limit: 20 } }})

    await waitFor(() => new Promise(r => setTimeout(r, 10)))

    expect(fetch).toHaveBeenLastCalledWith('/users', { query: { limit: 20 }})
    expect(result.current.loading).toBeTruthy()
    expect(result.current.data).toBe(latestData)

    await waitFor(() => new Promise(r => setTimeout(r, 500)))

    expect(result.current.loading).toBeFalsy()
    expect(result.current.data).not.toBeUndefined()
    expect(fetch).toHaveBeenCalledTimes(2)
  })

  it("don't automatically refetch if variables equal with previous variables", async () => {
    const { result, rerender } = renderHook((opts: UseApiOptions<any, any, any>) => Api.useApi('USERS', opts), {
      initialProps: {
        variables: {
          query: { limit: 10 }
        }
      }
    })

    await waitFor(() => new Promise(r => setTimeout(r, 10)))

    expect(fetch).toHaveBeenLastCalledWith('/users', { query: { limit: 10 }})

    await waitFor(() => new Promise(r => setTimeout(r, 500)))

    expect(result.current.loading).toBeFalsy()

    const latestData = result.current.data

    rerender({ variables: { query: { limit: 10 } }})

    await waitFor(() => new Promise(r => setTimeout(r, 10)))

    expect(result.current.data).toBe(latestData)
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it ("don't fetch if result is already cached", async () => {
    const hook1 = renderHook(() => Api.useApi('USERS'))

    await waitFor(() => expect(hook1.result.current.data).not.toBeUndefined())

    const hook2 = renderHook(() => Api.useApi('USERS'))

    expect(hook2.result.current.called).toBeTruthy()
    expect(hook2.result.current.loading).toBeFalsy()
    expect(hook2.result.current.data).toBe(hook1.result.current.data)

    await waitFor(() => new Promise(r => setTimeout(r, 500)))

    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it ("force fetch be called if force option is true", async () => {
    const hook1 = renderHook(() => Api.useApi('USERS'))

    await waitFor(() => expect(hook1.result.current.data).not.toBeUndefined())

    const hook2 = renderHook(() => Api.useApi('USERS', {
      force: true
    }))

    await waitFor(() => {
      expect(hook2.result.current.loading).toBeTruthy()
      expect(hook2.result.current.data).toBe(hook1.result.current.data)
    })

    expect(fetch).toHaveBeenCalledTimes(2)

    await waitFor(() => {
      expect(hook2.result.current.loading).toBeFalsy()
      expect(hook2.result.current.data).toBe(hook1.result.current.data)
    })
  })
})