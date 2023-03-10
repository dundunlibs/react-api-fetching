import { waitFor } from "@testing-library/react";
import { deepMerge, deepEqual, generateConcurrentFn } from "../utils";

describe('deepMerge', () => {
  it('merge 2 normal objects', () => {
    const a = { foo: 1, bar: 2 }
    const b = { foo: 3, baz: 4 }
    expect(deepMerge(a, b)).toEqual({ foo: 3, bar: 2, baz: 4 })
  })

  it('merge 2 nested objects have undefined or null fields', () => {
    const a = { foo: { foo1: 1, foo2: 2 }, bar: 2, baz: 3 }
    const b = { foo: { foo2: 3, foo3: 4 }, bar: undefined, baz: null }
    expect(deepMerge(a, b)).toEqual({ foo: { foo1: 1, foo2: 3, foo3: 4 }, bar: undefined, baz: null })
  })

  it('merge 2 nested objects have array fields', () => {
    const a = { foo: { foo1: 1, foo2: 2 }, bar: 2, baz: [1] }
    const b = { foo: { foo2: [3], foo3: 4 }, bar: [1,2,3], baz: [2] }
    expect(deepMerge(a, b)).toEqual({ foo: { foo1: 1, foo2: [3], foo3: 4 }, bar: [1,2,3], baz: [2] })
  })
})

describe('deepEqual', () => {
  it('compare 2 different types of objects', () => {
    const a = { foo: 'bar' }
    const b = ['foo', 'bar']
    expect(deepEqual(a, b)).toBeFalsy()
  })

  it('compare 2 normal objects', () => {
    const a = { foo: 1, bar: 'baz' }
    const b = {bar: 'baz', foo: 1 }
    expect(deepEqual(a, b)).toBeTruthy()
  })

  it('compare 2 normal objects', () => {
    const a = { foo: 1, bar: 'baz' }
    const b = {bar: 'baz', foo: 1 }
    expect(deepEqual(a, b)).toBeTruthy()
  })

  it('compare 2 nested objects', () => {
    const a = { foo: 1, bar: { a: 1, b: { c: 2 } } }
    const b = {bar: { a: 1, b: { c: 2 } }, foo: 1 }
    expect(deepEqual(a, b)).toBeTruthy()
  })

  it('compare 2 nested objects with one undefined field', () => {
    const a = { foo: 1, bar: { a: 1, b: { c: 2 } } }
    const b = {bar: { a: 1, b: { c: undefined } }, foo: 1 }
    expect(deepEqual(a, b)).toBeFalsy()
  })

  it('compare 2 nested objects with one array field', () => {
    const a = { foo: 1, bar: { a: 1, b: { c: [1,2,3], d: {} } } }
    const b = {bar: { b: { c: [1,2,3], d: {} }, a: 1 }, foo: 1 }
    expect(deepEqual(a, b)).toBeTruthy()
  })
})

describe('generateConcurrentFn', () => {
  const fn = jest.fn()
  const asyncFn = (...args: any) => new Promise(resolve => setTimeout(() => {
    fn(args)
    resolve(args)
  }, 10))
  const conFn = generateConcurrentFn(asyncFn)

  afterEach(() => {
    jest.clearAllMocks()
  })

  it ('call 2 functions with same args at the same time', async () => {
    let r1: any, r2: any
    conFn(1, 2).then(r => r1 = r)
    conFn(1, 2).then(r => r2 = r)

    await waitFor(() => {
      expect(r1).toEqual([1, 2])
      expect(r2).toEqual([1, 2])
    })

    expect(fn).toHaveBeenCalledTimes(1)
  })

  it ('call 2 functions with same args at 2 different times', async () => {
    let r1: any, r2: any
    conFn(1, 2).then(r => r1 = r)
    await waitFor(() => expect(r1).toEqual([1, 2]))

    conFn(1, 2).then(r => r2 = r)
    await waitFor(() => expect(r2).toEqual([1, 2]))

    expect(fn).toHaveBeenCalledTimes(2)
  })

  it ('call 2 functions with same args and 1 function with different args at the same time', async () => {
    let r1: any, r2: any, r3: any
    conFn(1, 2).then(r => r1 = r)
    conFn(1, 2).then(r => r2 = r)
    conFn(3).then(r => r3 = r)

    await waitFor(() => {
      expect(r1).toEqual([1, 2])
      expect(r2).toEqual([1, 2])
      expect(r3).toEqual([3])
    })

    expect(fn).toHaveBeenCalledTimes(2)
  })
})