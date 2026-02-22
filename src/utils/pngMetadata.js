import extract from 'png-chunks-extract'
import encode from 'png-chunks-encode'
import text from 'png-chunk-text'

export const SETTINGS_KEYWORD = 'ulam-spiral-settings'

const SETTINGS_KEYS = [
  'selectedMaxPrime',
  'numPolynomials',
  'resolution',
  'interpolationMethod',
  'dotColor',
  'splineColor',
  'backgroundColor',
  'radiusCircleThickness',
  'outerBorderColor',
  'splineThickness',
  'partitionColored',
  'numPartitions',
  'partitionColors',
  'dotShape',
  'dotSize',
  'transparency',
  'customizeDots',
  'customizeCurves',
  'customizeBorder',
  'customizeGrid',
  'gridMajorDegrees',
  'gridMinorDegrees',
  'gridThickness',
  'gridTicksEnabled',
  'tickThickness',
  'tickLength',
  'tickColor',
  'customizeTransparency',
]

export function settingsToPayload(settings) {
  const payload = {}
  for (const key of SETTINGS_KEYS) {
    const val = settings[key]
    if (val !== undefined) payload[key] = typeof val === 'object' ? [...val] : val
  }
  return payload
}

export function encodeSettingsInPng(pngBuffer, settingsPayload) {
  const chunks = extract(pngBuffer)
  const settingsJson = JSON.stringify(settingsPayload)
  const textChunk = text.encode(SETTINGS_KEYWORD, settingsJson)
  chunks.splice(-1, 0, textChunk)
  return new Uint8Array(encode(chunks))
}

export function extractSettingsFromPng(pngBuffer) {
  const buf = pngBuffer instanceof ArrayBuffer ? new Uint8Array(pngBuffer) : pngBuffer
  const chunks = extract(buf)
  for (const chunk of chunks) {
    if (chunk.name !== 'tEXt') continue
    let decoded
    try {
      decoded = text.decode(chunk.data)
    } catch {
      continue
    }
    if (decoded.keyword !== SETTINGS_KEYWORD) continue
    try {
      return JSON.parse(decoded.text)
    } catch {
      return null
    }
  }
  return null
}
