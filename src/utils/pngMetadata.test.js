import { describe, it, expect } from 'vitest'
import {
  settingsToPayload,
  extractSettingsFromPng,
  encodeSettingsInPng,
  SETTINGS_KEYWORD,
} from './pngMetadata.js'

const FULL_SETTINGS = {
  selectedMaxPrime: 62500,
  numPolynomials: 25,
  resolution: 1024,
  interpolationMethod: 'Natural cubic',
  dotColor: '#ffffff',
  splineColor: '#F4B942',
  backgroundColor: '#004990',
  radiusCircleThickness: 4,
  outerBorderColor: '#ffffff',
  splineThickness: 8,
  partitionColored: false,
  numPartitions: 4,
  partitionColors: ['#004990', '#1a5fa3', '#004990', '#1a5fa3'],
  dotShape: 'circle',
  dotSize: 2,
  transparency: 0,
}

describe('pngMetadata', () => {
  it('includes splineThickness and radiusCircleThickness in payload', () => {
    const payload = settingsToPayload(FULL_SETTINGS)
    expect(payload).toHaveProperty('splineThickness', 8)
    expect(payload).toHaveProperty('radiusCircleThickness', 4)
  })

  it('payload passes through JSON round-trip intact (simulates PNG encode/decode)', () => {
    const payload = settingsToPayload(FULL_SETTINGS)
    const json = JSON.stringify(payload)
    const parsed = JSON.parse(json)
    expect(parsed.splineThickness).toBe(8)
    expect(parsed.radiusCircleThickness).toBe(4)
  })
})
