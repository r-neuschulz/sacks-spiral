import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useSettingsStore } from './settings.js'

describe('settings store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('applyImportedSettings', () => {
    it('applies splineThickness and radiusCircleThickness from payload', () => {
      const store = useSettingsStore()
      expect(store.splineThickness).toBe(1.5)
      expect(store.radiusCircleThickness).toBe(0.5)

      store.applyImportedSettings({
        splineThickness: 8,
        radiusCircleThickness: 4,
      })

      expect(store.splineThickness).toBe(8)
      expect(store.radiusCircleThickness).toBe(4)
    })

    it('preserves values that exceed current UI max (e.g. from older versions)', () => {
      const store = useSettingsStore()
      store.applyImportedSettings({
        splineThickness: 12,
        radiusCircleThickness: 10,
        dotSize: 15,
      })
      expect(store.splineThickness).toBe(12)
      expect(store.radiusCircleThickness).toBe(10)
      expect(store.dotSize).toBe(15)
    })
  })
})
