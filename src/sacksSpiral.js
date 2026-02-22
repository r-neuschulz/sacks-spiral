export function sieveOfEratosthenes(maxN) {
  if (maxN < 2) return new Set()
  const isPrime = new Uint8Array(maxN + 1)
  isPrime.fill(1)
  isPrime[0] = isPrime[1] = 0
  const sqrtN = Math.floor(Math.sqrt(maxN))
  for (let p = 2; p <= sqrtN; p++) {
    if (isPrime[p]) {
      for (let k = p * p; k <= maxN; k += p) isPrime[k] = 0
    }
  }
  const primes = new Set()
  for (let n = 2; n <= maxN; n++) if (isPrime[n]) primes.add(n)
  return primes
}

export function numberToSacksCoord(n, step = 1) {
  if (n <= 0) return [0, 0]
  const r = step * Math.sqrt(n)
  const theta = 2 * Math.PI * Math.sqrt(n)
  return [r * Math.cos(theta), r * Math.sin(theta)]
}

export function findMostEfficientPolynomials(primes, maxNum, topK = 100, bRange = [-120, 120], cRange = [2, 200]) {
  const results = []
  for (let b = bRange[0]; b <= bRange[1]; b++) {
    for (let c = cRange[0]; c <= cRange[1]; c++) {
      if (!primes.has(c)) continue
      const primeSeq = []
      let x = 0
      let lastVal = -1
      while (true) {
        const val = x * x + b * x + c
        if (val > maxNum || val < 2) break
        if (primes.has(val) && val !== lastVal) {
          primeSeq.push(val)
          lastVal = val
        }
        x++
      }
      if (primeSeq.length > 0) {
        results.push({ b, c, count: primeSeq.length, primeSeq })
      }
    }
  }
  results.sort((a, b) => b.count - a.count)
  const top = results.slice(0, topK)
  const efficientPrimes = new Set()
  const orderedSeqs = []
  top.forEach(({ primeSeq }) => {
    primeSeq.forEach(p => efficientPrimes.add(p))
    orderedSeqs.push(primeSeq)
  })
  return { efficientPrimes, orderedSeqs }
}

export function sacksSpiral(primes, maxNum, step = 1) {
  const xCoords = [], yCoords = [], values = []
  const sorted = [...primes].sort((a, b) => a - b)
  for (const a of sorted) {
    const [x, y] = numberToSacksCoord(a, step)
    xCoords.push(x)
    yCoords.push(y)
    values.push(a)
  }
  return { x: xCoords, y: yCoords, values }
}
