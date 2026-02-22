# Sacks Spiral

Interactive visualization of the Sacks spiral (polar: $r=\sqrt{n}$, $\theta=2\pi\sqrt{n}$).

## Vue.js App

Interactive Sacks spiral viewer with real-time updates:

```bash
yarn install
yarn dev
```

Open http://localhost:5173

### Features

- **Real-time updates** – Settings changes apply immediately; computation runs in a Web Worker to keep the UI responsive
- **Interpolation methods, colors, polynomials, primes range** – Full control over spiral appearance

### Scripts

| Command       | Description                    |
| ------------- | ------------------------------ |
| `yarn dev`    | Start dev server               |
| `yarn build`  | Production build               |
| `yarn test`   | Run tests (watch mode)         |
| `yarn lint`   | ESLint                         |
| `yarn format` | Prettier                       |

### GitHub Pages

Uses hash mode (`#/`). Build and deploy the `dist` folder. Base path is relative (`./`), so it works from any URL (root, subpath, or local).

### Attribution

**Mathematical foundations**

- **Robert Sacks** (1994) devised the Sacks spiral: a polar layout with $r = \sqrt{n}$, $\theta = 2\pi\sqrt{n}$, making one rotation per perfect square. It reveals prime-rich curves along quadratic polynomials.
- **Stanisław Ulam** (1963) discovered the original Ulam spiral while doodling during a lecture; his square spiral sparked Sacks’ variation.
- **Leonhard Euler** (1772) published the prime-rich polynomial $n^2 - n + 41$, which yields 40 consecutive primes and appears as a prominent curve on the Sacks spiral.

**Inspiration and reference**

- [Majcher.net – Spirale Ulama / Spirale Roberta Sacksa](https://majcher.net/diagramy-ulama/) — Blog (PL) on Ulam vs Sacks spirals, Sieve of Eratosthenes, Euler’s polynomial, and “most effective” prime-rich polynomials. Also hosts [animated-ulam-spiral-generator](https://github.com/majchernet/animated-ulam-spiral-generator).
- [Fōrmulæ – Sacks spiral example](https://formulae.org/?script=examples/Sacks_spiral) — Interactive Sacks spiral in the Fōrmulæ scientific programming language.
- [Natural Numbers – The Sacks Number Spiral](https://www.naturalnumbers.org/sparticle.html) — Michael M. Ross’ exploration of product curves, pronic numbers, polynomial alignment, and Robert Sacks’ offset rule.
