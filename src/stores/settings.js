import { defineStore } from 'pinia'
import { getInterpolationNames } from '../interpolation.js'
import { dotShapeOptions } from '../constants.js'
import {
  PRIMES_MIN,
  PRIMES_MAX,
  POLY_MIN,
  POLY_MAX,
  PARTITIONS_MIN,
  PARTITIONS_MAX,
  RENDER_SIZE_MIN,
  RENDER_SIZE_MAX,
  RADIUS_THICKNESS_MAX,
  SPLINE_THICKNESS_MAX,
  GRID_THICKNESS_MIN,
  GRID_THICKNESS_MAX,
  TICK_THICKNESS_MIN,
  TICK_THICKNESS_MAX,
  TICK_LENGTH_MIN,
  TICK_LENGTH_MAX,
  DOT_SIZE_MIN,
} from '../constants.js'
import {
  clampInt,
  clampGridMajorDegrees,
  clampGridMinorDegrees,
  clampGridThickness,
  clampTransparency,
  clampDotSize,
  clampMinOnly,
  acceptNumber,
} from '../utils/clamp.js'

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function randomHex() {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
}

/** Field config for applyImportedSettings. Keys define payload source; target overrides store key (for legacy aliases). */
const IMPORT_FIELD_CONFIG = [
  { key: 'selectedMaxPrime', type: 'int', min: PRIMES_MIN, max: PRIMES_MAX },
  { key: 'numPolynomials', type: 'int', min: POLY_MIN, max: POLY_MAX },
  { key: 'resolution', type: 'int', min: RENDER_SIZE_MIN, max: RENDER_SIZE_MAX },
  { key: 'interpolationMethod', type: 'string' },
  { key: 'dotColor', type: 'string' },
  { key: 'splineColor', type: 'string' },
  { key: 'backgroundColor', type: 'string' },
  { key: 'radiusCircleThickness', type: 'clampMin', fn: (v, f) => clampMinOnly(v, 0, f) },
  { key: 'outerBorderColor', type: 'string' },
  { key: 'splineThickness', type: 'clampMin', fn: (v, f) => clampMinOnly(v, 0.01, f) },
  { key: 'partitionColored', type: 'boolean' },
  { key: 'customizeGrid', type: 'boolean' },
  { key: 'customizeSectors', target: 'customizeGrid', type: 'boolean' },
  { key: 'gridMajorDegrees', type: 'clamp', fn: clampGridMajorDegrees },
  { key: 'gridMinorDegrees', type: 'clamp', fn: clampGridMinorDegrees },
  { key: 'gridThickness', type: 'clamp', fn: clampGridThickness },
  { key: 'gridTicksEnabled', type: 'boolean' },
  { key: 'tickThickness', type: 'clampMin', fn: (v, f) => acceptNumber(v, f) },
  { key: 'tickLength', type: 'clampMin', fn: (v, f) => acceptNumber(v, f) },
  { key: 'tickColor', type: 'string' },
  { key: 'customizeDots', type: 'boolean' },
  { key: 'customizeCurves', type: 'boolean' },
  { key: 'customizeBorder', type: 'boolean' },
  { key: 'customizeTransparency', type: 'boolean' },
  { key: 'numPartitions', type: 'int', min: PARTITIONS_MIN, max: PARTITIONS_MAX },
  { key: 'dotShape', type: 'string' },
  { key: 'dotSize', type: 'clampMin', fn: (v, f) => clampMinOnly(v, DOT_SIZE_MIN, f) },
  { key: 'transparency', type: 'clamp', fn: clampTransparency },
]

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    selectedMaxPrime: 63000,
    numPolynomials: 25,
    resolution: 1024,
    interpolationMethod: 'Natural cubic',
    dotColor: '#ffffff',
    splineColor: '#E8B84A',
    backgroundColor: '#0d2137',
    radiusCircleThickness: 0.5,
    outerBorderColor: '#ffffff',
    splineThickness: 1.5,
    partitionColored: false,
    numPartitions: 4,
    partitionColors: ['#004990', '#1a5fa3', '#004990', '#1a5fa3'],
    gridMajorDegrees: 90,
    gridMinorDegrees: 15,
    gridThickness: 1,
    gridTicksEnabled: false,
    tickThickness: 0.5,
    tickLength: 12,
    tickColor: '#ffffff',
    dotShape: 'circle',
    dotSize: 2,
    transparency: 0,
    customizeDots: false,
    customizeCurves: false,
    customizeBorder: true,
    customizeGrid: false,
    customizeTransparency: false,
  }),
  persist: {
    afterHydrate: (ctx) => {
      ctx.store.resolution ??= 1024
      delete ctx.store.renderWidth
      delete ctx.store.renderHeight
      if (ctx.store.partitionColored !== undefined && ctx.store.customizeGrid === undefined && ctx.store.customizeSectors === undefined) {
        ctx.store.customizeGrid = ctx.store.partitionColored
      }
      if (ctx.store.customizeSectors !== undefined) {
        ctx.store.customizeGrid = ctx.store.customizeSectors
        delete ctx.store.customizeSectors
      }
      // Migrate from old quadrant-based settings
      if (ctx.store.quadrantColored !== undefined) {
        ctx.store.partitionColored = ctx.store.quadrantColored
        ctx.store.customizeGrid ??= ctx.store.quadrantColored
        delete ctx.store.quadrantColored
      }
      if (ctx.store.quadrantColor1 !== undefined) {
        ctx.store.partitionColors = [
          ctx.store.quadrantColor1 ?? '#004990',
          ctx.store.quadrantColor2 ?? '#1a5fa3',
          ctx.store.quadrantColor3 ?? '#004990',
          ctx.store.quadrantColor4 ?? '#1a5fa3',
        ]
        ctx.store.numPartitions = 4
        delete ctx.store.quadrantColor1
        delete ctx.store.quadrantColor2
        delete ctx.store.quadrantColor3
        delete ctx.store.quadrantColor4
      }
      const n = Math.max(2, Math.min(12, ctx.store.numPartitions ?? 4))
      let colors = [...(ctx.store.partitionColors || ['#004990', '#1a5fa3', '#004990', '#1a5fa3'])]
      while (colors.length < n) {
        colors.push(colors[(colors.length - 1) % colors.length])
      }
      ctx.store.numPartitions = n
      ctx.store.partitionColors = colors.slice(0, n)
      ctx.store.outerBorderColor ??= '#ffffff'
      ctx.store.customizeDots ??= false
      ctx.store.customizeCurves ??= false
      ctx.store.customizeBorder ??= false
      ctx.store.customizeGrid ??= ctx.store.partitionColored ?? false
      ctx.store.gridMajorDegrees ??= 90
      ctx.store.gridMinorDegrees ??= 15
      ctx.store.gridThickness ??= 1
      ctx.store.gridTicksEnabled ??= false
      ctx.store.tickThickness ??= 0.5
      ctx.store.tickLength ??= 12
      ctx.store.tickColor ??= '#ffffff'
      ctx.store.customizeTransparency ??= false
    },
  },
  actions: {
    applyImportedSettings(payload) {
      if (!payload || typeof payload !== 'object') return

      for (const field of IMPORT_FIELD_CONFIG) {
        const raw = payload[field.key]
        if (raw == null) continue

        const targetKey = field.target ?? field.key
        const storeFallback = this[targetKey]

        let value
        if (field.type === 'int') {
          value = clampInt(raw, field.min, field.max, storeFallback)
        } else if (field.type === 'string') {
          value = String(raw)
        } else if (field.type === 'boolean') {
          value = Boolean(raw)
        } else if (field.type === 'clamp' || field.type === 'clampMin') {
          value = field.fn(raw, storeFallback)
        }

        if (value !== undefined) this[targetKey] = value
      }

      if (Array.isArray(payload.partitionColors)) {
        const len = clampInt(this.numPartitions, PARTITIONS_MIN, PARTITIONS_MAX, 4)
        const colors = payload.partitionColors.slice(0, len)
        while (colors.length < len) colors.push(colors[colors.length - 1] ?? '#004990')
        this.partitionColors = colors.slice(0, len)
      }
    },
    randomizeSettings() {
      const methods = getInterpolationNames()
      const shapes = dotShapeOptions.map((o) => o.value)
      const n = randomInt(PARTITIONS_MIN, PARTITIONS_MAX)

      this.selectedMaxPrime = randomInt(PRIMES_MIN, PRIMES_MAX)
      this.numPolynomials = randomInt(POLY_MIN, POLY_MAX)
      const resSteps = [256, 512, 1024, 2048, 4096].filter(
        (r) => r >= RENDER_SIZE_MIN && r <= RENDER_SIZE_MAX
      )
      this.resolution = resSteps[randomInt(0, resSteps.length - 1)] ?? 1024
      this.interpolationMethod = methods[randomInt(0, methods.length - 1)]
      this.dotColor = randomHex()
      this.splineColor = randomHex()
      this.backgroundColor = randomHex()
      this.radiusCircleThickness = 0.5 * randomInt(0, (RADIUS_THICKNESS_MAX * 2) | 0)
      this.outerBorderColor = randomHex()
      this.splineThickness = 0.25 * randomInt(2, SPLINE_THICKNESS_MAX * 4)
      this.customizeGrid = Math.random() > 0.5
      // partitionColored only applies when grid is enabled
      this.partitionColored = this.customizeGrid && Math.random() > 0.3
      this.gridMajorDegrees = [45, 90, 180, 360][randomInt(0, 3)]
      this.gridMinorDegrees = [5, 10, 15, 30][randomInt(0, 3)]
      this.gridThickness = 0.25 * randomInt(GRID_THICKNESS_MIN * 4, GRID_THICKNESS_MAX * 4)
      this.gridTicksEnabled = Math.random() > 0.5
      this.tickThickness = 0.25 * randomInt(TICK_THICKNESS_MIN * 4, TICK_THICKNESS_MAX * 4)
      this.tickLength = randomInt(TICK_LENGTH_MIN, TICK_LENGTH_MAX)
      this.tickColor = randomHex()
      this.numPartitions = n
      this.partitionColors = Array.from({ length: n }, () => randomHex())
      this.dotShape = shapes[randomInt(0, shapes.length - 1)]
      this.dotSize = 0.5 * randomInt(DOT_SIZE_MIN * 2, DOT_SIZE_MAX * 2)
      this.transparency = 5 * randomInt(0, 20)
      this.customizeDots = Math.random() > 0.5
      this.customizeCurves = Math.random() > 0.5
      this.customizeBorder = Math.random() > 0.5
      this.customizeTransparency = Math.random() > 0.5
    },
  },
})
