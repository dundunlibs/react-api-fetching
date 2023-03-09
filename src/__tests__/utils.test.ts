import { deepMerge, deepEqual } from "../utils";

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