import { describe, it, expect } from 'vitest'
import {
  sieveOfEratosthenes,
  numberToSacksCoord,
  findMostEfficientPolynomials,
  sacksSpiral,
} from './sacksSpiral.js'

describe('sieveOfEratosthenes', () => {
  it('returns empty set for maxN < 2', () => {
    expect(sieveOfEratosthenes(0)).toEqual(new Set())
    expect(sieveOfEratosthenes(1)).toEqual(new Set())
  })

  it('finds primes up to 10', () => {
    const primes = sieveOfEratosthenes(10)
    expect(primes).toEqual(new Set([2, 3, 5, 7]))
  })

  it('finds primes up to 30', () => {
    const primes = sieveOfEratosthenes(30)
    expect(primes).toEqual(new Set([2, 3, 5, 7, 11, 13, 17, 19, 23, 29]))
  })

  it('includes maxN when it is prime', () => {
    const primes = sieveOfEratosthenes(11)
    expect(primes.has(11)).toBe(true)
  })

  it('excludes composite numbers', () => {
    const primes = sieveOfEratosthenes(100)
    expect(primes.has(4)).toBe(false)
    expect(primes.has(6)).toBe(false)
    expect(primes.has(9)).toBe(false)
    expect(primes.has(15)).toBe(false)
  })
})

describe('numberToSacksCoord', () => {
  it('returns [0,0] for n <= 0', () => {
    expect(numberToSacksCoord(0)).toEqual([0, 0])
    expect(numberToSacksCoord(-1)).toEqual([0, 0])
  })

  it('returns correct polar conversion for n=1', () => {
    const [x, y] = numberToSacksCoord(1, 1)
    expect(x).toBeCloseTo(1, 5)
    expect(y).toBeCloseTo(0, 5)
  })

  it('returns correct coords for n=4 with step=1', () => {
    const [x, y] = numberToSacksCoord(4, 1)
    // r=2, theta=4π → cos(4π)=1, sin(4π)=0
    expect(x).toBeCloseTo(2, 5)
    expect(y).toBeCloseTo(0, 5)
  })

  it('respects step parameter', () => {
    const [x1, y1] = numberToSacksCoord(1, 1)
    const [x2, y2] = numberToSacksCoord(1, 2)
    expect(x2).toBeCloseTo(x1 * 2, 5)
    expect(y2).toBeCloseTo(y1 * 2, 5)
  })
})

describe('findMostEfficientPolynomials', () => {
  it('returns empty when primes set is empty', () => {
    const primes = new Set()
    const result = findMostEfficientPolynomials(primes, 10, 5)
    expect(result.efficientPrimes.size).toBe(0)
    expect(result.orderedSeqs).toEqual([])
  })

  it('finds polynomial sequences', () => {
    const primes = sieveOfEratosthenes(100)
    const { efficientPrimes, orderedSeqs } = findMostEfficientPolynomials(primes, 100, 5)
    expect(orderedSeqs.length).toBeGreaterThan(0)
    expect(efficientPrimes.size).toBeGreaterThan(0)
  })

  it('returns top-k sequences by count', () => {
    const primes = sieveOfEratosthenes(50)
    const { orderedSeqs } = findMostEfficientPolynomials(primes, 50, 3)
    expect(orderedSeqs.length).toBeLessThanOrEqual(3)
    if (orderedSeqs.length >= 2) {
      expect(orderedSeqs[0].length).toBeGreaterThanOrEqual(orderedSeqs[1].length)
    }
  })

  it('finds Euler-style polynomial x²-x+41 and deduplicates consecutive values', () => {
    const primes = sieveOfEratosthenes(2000)
    const { orderedSeqs } = findMostEfficientPolynomials(primes, 2000, 250)
    // Euler's x²-x+41 yields 41 at both x=0 and x=1; we should dedupe to [41, 43, 47, ...]
    const eulerSeq = orderedSeqs.find((seq) => seq[0] === 41 && seq[1] === 43)
    expect(eulerSeq).toBeDefined()
    expect(eulerSeq.slice(0, 8)).toEqual([41, 43, 47, 53, 61, 71, 83, 97])
    // No consecutive duplicates in any sequence
    for (let i = 0; i < eulerSeq.length - 1; i++) {
      expect(eulerSeq[i]).not.toBe(eulerSeq[i + 1])
    }
  })
})

describe('sacksSpiral', () => {
  it('returns empty arrays for empty primes', () => {
    const result = sacksSpiral(new Set(), 10)
    expect(result.x).toEqual([])
    expect(result.y).toEqual([])
    expect(result.values).toEqual([])
  })

  it('generates coords for primes', () => {
    const primes = sieveOfEratosthenes(10)
    const { x, y, values } = sacksSpiral(primes, 10)
    expect(values).toEqual([2, 3, 5, 7])
    expect(x.length).toBe(4)
    expect(y.length).toBe(4)
    expect(x.length).toBe(y.length)
  })

  it('matches numberToSacksCoord for each prime', () => {
    const primes = sieveOfEratosthenes(20)
    const { x, y, values } = sacksSpiral(primes, 20)
    for (let i = 0; i < values.length; i++) {
      const [expectedX, expectedY] = numberToSacksCoord(values[i], 1)
      expect(x[i]).toBeCloseTo(expectedX, 5)
      expect(y[i]).toBeCloseTo(expectedY, 5)
    }
  })
})
