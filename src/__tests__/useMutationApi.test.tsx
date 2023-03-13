import { waitFor } from '@testing-library/react'
import { fetch, Api, renderHook, resetCache, cache } from '../test-utils'

describe('useMutationApi', () => {
  beforeEach(() => {
    resetCache()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('fetch data', async () => {
    const { result } = renderHook(() => Api.useMutationApi('USERS'))

    expect(result.current[1].loading).toBeFalsy()
    expect(result.current[1].data).toBeUndefined()
    expect(result.current[1].error).toBeUndefined()

    await waitFor(() => result.current[0]())

    expect(fetch).toHaveBeenCalledTimes(1)
    expect(result.current[1].loading).toBeFalsy()
    expect(result.current[1].error).toBeNull()
    expect(result.current[1].data).toEqual([
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

  it('data should not be cached', async () => {
    const { result } = renderHook(() => Api.useMutationApi('USERS'))

    await waitFor(() => result.current[0]())

    expect(cache.get('["USERS",{}]')).toEqual({
      loading: false,
      data: undefined,
      error: undefined
    })
  })
})