import { waitFor } from '@testing-library/react'
import { fetch, Api, render, renderHook, resetCache } from '../test-utils'
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
    const { result, rerender } = renderHook((opts: UseApiOptions<any, any, any, any, any>) => Api.useApi('USERS', opts), {
      initialProps: { skip: true }
    })

    await waitFor(() => new Promise(r => setTimeout(r, 100)))

    expect(result.current.called).toBeFalsy()
    expect(result.current.loading).toBeFalsy()
    expect(result.current.data).toBeUndefined()
    expect(fetch).not.toHaveBeenCalled()

    rerender({ skip: false })

    await waitFor(() => expect(result.current.loading).toBeTruthy())

    expect(result.current.data).toBeUndefined()
    expect(result.current.called).toBeTruthy()

    await waitFor(() => expect(result.current.loading).toBeFalsy())

    expect(result.current.data).not.toBeUndefined()
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  describe("change variables", () => {
    it("don't automatically refetch if variables is equal with the previous one", async () => {
      const { result, rerender } = renderHook((opts: UseApiOptions<any, any, any, any, any>) => Api.useApi('USERS', opts), {
        initialProps: {
          variables: {
            query: { limit: 10 }
          }
        }
      })

      await waitFor(() => {
        expect(fetch).toHaveBeenLastCalledWith('/users', { query: { limit: 10 }})
        expect(result.current.loading).toBeFalsy()
      })

      const latestData = result.current.data

      rerender({ variables: { query: { limit: 10 } }})

      await waitFor(() => new Promise(r => setTimeout(r, 10)))

      expect(result.current.data).toBe(latestData)
      expect(fetch).toHaveBeenCalledTimes(1)
    })

    it("automatically refetch if variables is not equal with the previous one", async () => {
      const { result, rerender } = renderHook((opts: UseApiOptions<any, any, any, any, any>) => Api.useApi('USERS', opts), {
        initialProps: {
          variables: {
            query: { limit: 10 }
          }
        }
      })

      await waitFor(() => expect(fetch).toHaveBeenLastCalledWith('/users', { query: { limit: 10 }}))

      expect(result.current.loading).toBeTruthy()
      expect(result.current.data).toBeUndefined()

      await waitFor(() => expect(result.current.loading).toBeFalsy())

      expect(result.current.data).not.toBeUndefined()

      const latestData = result.current.data

      rerender({ variables: { query: { limit: 20 } }})

      await waitFor(() => expect(fetch).toHaveBeenLastCalledWith('/users', { query: { limit: 20 }}))

      expect(result.current.loading).toBeTruthy()
      expect(result.current.data).toBe(latestData)

      await waitFor(() => expect(result.current.loading).toBeFalsy())

      expect(result.current.data).not.toBeUndefined()
      expect(fetch).toHaveBeenCalledTimes(2)
    })

    it("don't refetch and return result if it's already cached", async () => {
      const { result, rerender } = renderHook((opts: UseApiOptions<any, any, any, any, any>) => Api.useApi('USERS', opts), {
        initialProps: {
          variables: {
            query: { limit: 1 }
          }
        }
      })

      await waitFor(() => expect(fetch).toHaveBeenLastCalledWith('/users', { query: { limit: 1 }}))
      await waitFor(() => expect(result.current.data).not.toBeUndefined())

      const firstData = result.current.data

      rerender({ variables: { query: { limit: 2 } }})

      await waitFor(() => {
        expect(result.current.loading).toBeTruthy()
        expect(fetch).toHaveBeenLastCalledWith('/users', { query: { limit: 2 }})
      })

      await waitFor(() => expect(result.current.loading).toBeFalsy())

      expect(result.current.data).not.toEqual(firstData)
      expect(fetch).toHaveBeenCalledTimes(2)

      rerender({ variables: { query: { limit: 1 } }})
      expect(result.current.data).toEqual(firstData)
    })
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

  it ("ensure fetch be called once at the same time", async () => {
    let r1: any, r2: any
    const Component = () => {
      r1 = Api.useApi('USERS')
      r2 = Api.useApi('USERS')
      return null
    }
    render(<Component />)

    await waitFor(() => {
      expect(r1.data).not.toBeUndefined()
      expect(r2.data).not.toBeUndefined()
    })

    expect(fetch).toHaveBeenCalledTimes(1)
  })
})