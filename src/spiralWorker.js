import { sieveOfEratosthenes, findMostEfficientPolynomials, sacksSpiral } from './sacksSpiral.js'
import { clampPrimes, clampPoly } from './utils/clamp.js'

self.onmessage = (e) => {
  const { maxPrime, numPolynomials: polyCount, generation } = e.data
  const maxNum = clampPrimes(maxPrime)
  const poly = clampPoly(polyCount)

  const primes = sieveOfEratosthenes(maxNum)
  const { efficientPrimes, orderedSeqs } = findMostEfficientPolynomials(primes, maxNum, poly)
  const step = 1
  const { x, y, values } = sacksSpiral(primes, maxNum, step)

  const valueToCoordFlat = new Float64Array(values.length * 3)
  const xReg = []
  const yReg = []
  const xEff = []
  const yEff = []

  for (let i = 0; i < values.length; i++) {
    const v = values[i]
    valueToCoordFlat[i * 3] = v
    valueToCoordFlat[i * 3 + 1] = x[i]
    valueToCoordFlat[i * 3 + 2] = y[i]

    if (efficientPrimes.has(v)) {
      xEff.push(x[i])
      yEff.push(y[i])
    } else {
      xReg.push(x[i])
      yReg.push(y[i])
    }
  }

  const counts = orderedSeqs.map((s) => s.length)
  const xRegArr = new Float64Array(xReg)
  const yRegArr = new Float64Array(yReg)
  const xEffArr = new Float64Array(xEff)
  const yEffArr = new Float64Array(yEff)

  const transferList = [
    valueToCoordFlat.buffer,
    xRegArr.buffer,
    yRegArr.buffer,
    xEffArr.buffer,
    yEffArr.buffer,
  ]

  self.postMessage(
    {
      generation,
      maxNum,
      valueToCoordFlat,
      xReg: xRegArr,
      yReg: yRegArr,
      xEff: xEffArr,
      yEff: yEffArr,
      orderedSeqs,
      counts: { min: Math.min(...counts), max: Math.max(...counts) },
    },
    transferList
  )
}
