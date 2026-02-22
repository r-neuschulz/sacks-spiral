import {
  PRIMES_MIN,
  PRIMES_MAX,
  POLY_MIN,
  POLY_MAX,
  RENDER_SIZE_MIN,
  RENDER_SIZE_MAX,
  RADIUS_THICKNESS_MAX,
  SPLINE_THICKNESS_MAX,
  GRID_MAJOR_DEGREES_MIN,
  GRID_MAJOR_DEGREES_MAX,
  GRID_MINOR_DEGREES_MIN,
  GRID_MINOR_DEGREES_MAX,
  GRID_SECTIONS_MIN,
  GRID_SECTIONS_MAX,
  GRID_THICKNESS_MIN,
  GRID_THICKNESS_MAX,
  TICK_THICKNESS_MIN,
  TICK_THICKNESS_MAX,
  TICK_LENGTH_MIN,
  TICK_LENGTH_MAX,
  PARTITIONS_MIN,
  PARTITIONS_MAX,
  TRANSPARENCY_MIN,
  TRANSPARENCY_MAX,
  DOT_SIZE_MIN,
  DOT_SIZE_MAX,
} from '../constants.js'

/** Clamp a numeric value to [min, max], returning fallback if val is NaN. */
export function clampValue(val, min, max, fallback) {
  const v = Number(val)
  if (Number.isNaN(v)) return fallback
  return Math.max(min, Math.min(max, v))
}

/** Clamp and round to integer. */
export function clampInt(val, min, max, fallback) {
  const v = Math.round(Number(val))
  if (Number.isNaN(v)) return fallback
  return Math.max(min, Math.min(max, v))
}

/** Enforce minimum only (no max). Used when importing to preserve values from older versions. */
export function clampMinOnly(val, min, fallback) {
  const v = Number(val)
  if (Number.isNaN(v)) return fallback
  return Math.max(min, v)
}

/** Accept any number (no clamping). Used for tick thickness/length which allow negative (inward). */
export function acceptNumber(val, fallback) {
  const v = Number(val)
  return Number.isNaN(v) ? fallback : v
}

export function clampPrimes(v) {
  const val = Math.round(Number(v)) || PRIMES_MIN
  return Math.max(PRIMES_MIN, Math.min(PRIMES_MAX, val))
}

export function clampPoly(v) {
  const val = Math.round(Number(v)) || POLY_MIN
  return Math.max(POLY_MIN, Math.min(POLY_MAX, val))
}

export function clampRenderSize(v) {
  const val = Math.round(Number(v)) || RENDER_SIZE_MIN
  return Math.max(RENDER_SIZE_MIN, Math.min(RENDER_SIZE_MAX, val))
}

export function clampGridMajorDegrees(v, fallback = 90) {
  return clampValue(v, GRID_MAJOR_DEGREES_MIN, GRID_MAJOR_DEGREES_MAX, fallback)
}

export function clampGridMinorDegrees(v, fallback = 15) {
  return clampValue(v, GRID_MINOR_DEGREES_MIN, GRID_MINOR_DEGREES_MAX, fallback)
}

export function clampPartitions(v, fallback = 4) {
  return clampInt(v, PARTITIONS_MIN, PARTITIONS_MAX, fallback)
}

export function clampGridSections(v, fallback = 4) {
  return clampInt(v, GRID_SECTIONS_MIN, GRID_SECTIONS_MAX, fallback)
}

export function clampGridThickness(v, fallback = 1) {
  return clampValue(v, GRID_THICKNESS_MIN, GRID_THICKNESS_MAX, fallback)
}

export function clampTickThickness(v, fallback = 0.5) {
  return clampValue(v, TICK_THICKNESS_MIN, TICK_THICKNESS_MAX, fallback)
}

export function clampTickLength(v, fallback = 12) {
  return clampValue(v, TICK_LENGTH_MIN, TICK_LENGTH_MAX, fallback)
}

export function clampTransparency(v, fallback = 0) {
  return clampValue(v, TRANSPARENCY_MIN, TRANSPARENCY_MAX, fallback)
}

export function clampDotSize(v, fallback = 2) {
  return clampValue(v, DOT_SIZE_MIN, DOT_SIZE_MAX, fallback)
}

export function clampRadiusThickness(v, fallback = 0) {
  return clampValue(v, 0, RADIUS_THICKNESS_MAX, fallback)
}

/** Min 0.01 to avoid zero (which would hide the border). */
export function clampSplineThickness(v, fallback = 1.5) {
  return clampValue(v, 0.01, SPLINE_THICKNESS_MAX, fallback)
}
