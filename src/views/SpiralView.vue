<script setup>
import { ref, watch, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useDebounceFn, useThrottleFn } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import SpiralSidebar from '../components/SpiralSidebar.vue'
import UiButton from '../components/ui/button.vue'
import UiDialog from '../components/ui/dialog.vue'
import UiTooltip from '../components/ui/tooltip.vue'
import MathInline from '../components/MathInline.vue'
import { DialogTitle, DialogDescription, DialogClose } from 'reka-ui'
import { Shuffle, Download, Info } from 'lucide-vue-next'
import { useSettingsStore } from '../stores/settings.js'
import { curvePath } from '../interpolation.js'
import { hexToRgba, drawShapesBatch } from '../utils/drawHelpers.js'
import { extractDominantColor, accentToThemeVariables } from '../utils/colorUtils.js'
import {
  settingsToPayload,
  encodeSettingsInPng,
} from '../utils/pngMetadata.js'
import {
  clampRenderSize,
  clampGridMajorDegrees,
  clampGridMinorDegrees,
  clampGridSections,
  clampTransparency,
  clampTickLength,
  clampDotSize,
} from '../utils/clamp.js'

const settings = useSettingsStore()
const {
  selectedMaxPrime,
  numPolynomials,
  interpolationMethod,
  dotColor,
  splineColor,
  backgroundColor,
  radiusCircleThickness,
  outerBorderColor,
  splineThickness,
  partitionColored,
  numPartitions,
  partitionColors,
  dotShape,
  dotSize,
  transparency,
  resolution,
  customizeDots,
  customizeCurves,
  customizeBorder,
  customizeGrid,
  gridMajorDegrees,
  gridMinorDegrees,
  gridThickness,
  gridTicksEnabled,
  tickThickness,
  tickLength,
  tickColor,
  customizeTransparency,
} = storeToRefs(settings)

const canvasRef = ref(null)
const blurCanvasRef = ref(null)

const spiralData = ref({
  maxNum: 0,
  valueToCoord: new Map(),
  xReg: [], yReg: [], xEff: [], yEff: [],
  orderedSeqs: [],
  counts: { min: 0, max: 0 }
})

const isLoading = ref(false)
const workerRef = ref(null)
const computeGenerationRef = ref(0)
const offscreenCanvasRef = ref(null)
const offscreenCtxRef = ref(null)
const spinnerDelayIdRef = ref(null)
const showInfoModal = ref(false)

function unpackValueToCoord(flat) {
  const map = new Map()
  for (let i = 0; i < flat.length; i += 3) {
    map.set(flat[i], [flat[i + 1], flat[i + 2]])
  }
  return map
}

function applyWorkerResult(msg) {
  const { generation, maxNum, valueToCoordFlat, xReg, yReg, xEff, yEff, orderedSeqs, counts } = msg.data
  if (generation !== computeGenerationRef.value) return
  const valueToCoord = unpackValueToCoord(valueToCoordFlat)
  spiralData.value = {
    maxNum,
    valueToCoord,
    xReg: Array.from(xReg),
    yReg: Array.from(yReg),
    xEff: Array.from(xEff),
    yEff: Array.from(yEff),
    orderedSeqs,
    counts,
  }
  if (spinnerDelayIdRef.value) {
    clearTimeout(spinnerDelayIdRef.value)
    spinnerDelayIdRef.value = null
  }
  isLoading.value = false
  requestAnimationFrame(drawCanvas)
}

function drawSpiral(ctx, w, h) {
  if (!spiralData.value.maxNum) return
  const maxRadius = Math.sqrt(spiralData.value.maxNum)
  const margin = 20
  const scale = Math.min(w, h) / (2 * maxRadius + 2 * margin)
  const cx = w / 2
  const cy = h / 2
  const toScreen = (x, y) => [cx + x * scale, cy - y * scale]

  ctx.fillStyle = backgroundColor.value
  ctx.fillRect(0, 0, w, h)

  const { xReg, yReg, xEff, yEff, orderedSeqs, counts } = spiralData.value
  const countRange = Math.max(1, counts.max - counts.min)

  const effectiveTransparency = customizeTransparency.value ? (Number(transparency.value) || 0) : 0
  const clampedTransparency = clampTransparency(effectiveTransparency, 0)
  const opacity = 1 - clampedTransparency / 100

  ctx.save()
  ctx.translate(cx, cy)
  ctx.scale(scale, -scale)
  const majorDeg = clampGridMajorDegrees(gridMajorDegrees.value)
  const minorDeg = clampGridMinorDegrees(gridMinorDegrees.value)
  const toRad = Math.PI / 180
  if (customizeGrid.value) {
    const n = clampGridSections(numPartitions.value)
    const colors = partitionColors.value || []
    const angleStep = (2 * Math.PI) / n
    if (partitionColored.value) {
      for (let q = 0; q < n; q++) {
        ctx.fillStyle = colors[q] ?? '#004990'
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.arc(0, 0, maxRadius, q * angleStep, (q + 1) * angleStep)
        ctx.closePath()
        ctx.fill()
      }
    }
    const gw = (Number(gridThickness.value) || 1) / scale
    ctx.strokeStyle = 'rgba(255,255,255,0.4)'
    ctx.lineWidth = gw
    for (let deg = 0; deg < 360; deg += minorDeg) {
      if (deg % majorDeg === 0 && deg > 0) continue
      const a = deg * toRad
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(maxRadius * Math.cos(a), maxRadius * Math.sin(a))
      ctx.stroke()
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.75)'
    ctx.lineWidth = gw
    for (let deg = 0; deg < 360; deg += majorDeg) {
      const a = deg * toRad
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(maxRadius * Math.cos(a), maxRadius * Math.sin(a))
      ctx.stroke()
    }
  }
  if (gridTicksEnabled.value) {
    const tickLen = clampTickLength(tickLength.value) / scale
    const tw = Math.max(1 / scale, Math.abs(Number(tickThickness.value) || 0.5) / scale)
    ctx.strokeStyle = tickColor.value ?? '#ffffff'
    ctx.lineWidth = tw
    for (let deg = 0; deg < 360; deg += minorDeg) {
      const a = deg * toRad
      const tx = maxRadius * Math.cos(a)
      const ty = maxRadius * Math.sin(a)
      const ox = Math.cos(a)
      const oy = Math.sin(a)
      ctx.beginPath()
      ctx.moveTo(tx, ty)
      ctx.lineTo(tx + tickLen * ox, ty + tickLen * oy)
      ctx.stroke()
    }
  }
  const thickness = customizeBorder.value ? Math.max(0, Number(radiusCircleThickness.value) || 0) : 0
  if (thickness > 0) {
    ctx.strokeStyle = outerBorderColor.value ?? '#ffffff'
    ctx.lineWidth = thickness / scale
    ctx.beginPath()
    ctx.arc(0, 0, maxRadius, 0, Math.PI * 2)
    ctx.stroke()
  }
  const drawCurves = customizeCurves.value
  const effectiveSplineColor = drawCurves ? splineColor.value : '#F4B942'
  const effectiveSplineThickness = drawCurves ? (Number(splineThickness.value) || 1.5) : 1.5
  orderedSeqs.forEach((primeSeq) => {
    const coords = primeSeq
      .filter(p => spiralData.value.valueToCoord.has(p))
      .map(p => spiralData.value.valueToCoord.get(p))
    if (coords.length < 1) return
    // Extrapolate last point radially to border so curves reach the edge
    const last = coords[coords.length - 1]
    const r = Math.hypot(last[0], last[1])
    if (r > 1e-6) {
      const radialScale = maxRadius / r
      coords.push([last[0] * radialScale, last[1] * radialScale])
    }
    if (coords.length < 2) return
    const pathStr = curvePath(coords, interpolationMethod.value)
    if (!pathStr) return
    const path = new Path2D(pathStr)
    const alpha = opacity * (0.3 + 0.6 * (primeSeq.length - counts.min) / countRange)
    ctx.strokeStyle = hexToRgba(effectiveSplineColor, alpha)
    ctx.lineWidth = Math.max(0.5, effectiveSplineThickness) / scale
    ctx.stroke(path)
  })
  ctx.restore()

  const effectiveDotShape = customizeDots.value ? (dotShape.value || 'circle') : 'circle'
  const effectiveDotSize = customizeDots.value ? clampDotSize(dotSize.value) : 2
  const effectiveDotColor = customizeDots.value ? dotColor.value : '#ffffff'
  const sizeReg = effectiveDotSize
  const sizeEff = sizeReg * 1.25
  ctx.fillStyle = hexToRgba(effectiveDotColor, 0.5 * opacity)
  if (effectiveDotShape === 'circle') {
    ctx.beginPath()
    xReg.forEach((xi, i) => {
      const [sx, sy] = toScreen(xi, yReg[i])
      ctx.moveTo(sx + sizeReg, sy)
      ctx.arc(sx, sy, sizeReg, 0, Math.PI * 2)
    })
    ctx.fill()
    ctx.fillStyle = hexToRgba(effectiveSplineColor, opacity)
    ctx.beginPath()
    xEff.forEach((xi, i) => {
      const [sx, sy] = toScreen(xi, yEff[i])
      ctx.moveTo(sx + sizeEff, sy)
      ctx.arc(sx, sy, sizeEff, 0, Math.PI * 2)
    })
    ctx.fill()
  } else {
    const regPoints = xReg.map((xi, i) => toScreen(xi, yReg[i]))
    drawShapesBatch(ctx, regPoints, sizeReg, effectiveDotShape)
    ctx.fillStyle = hexToRgba(effectiveSplineColor, opacity)
    const effPoints = xEff.map((xi, i) => toScreen(xi, yEff[i]))
    drawShapesBatch(ctx, effPoints, sizeEff, effectiveDotShape)
  }
}

function drawCanvas() {
  const canvas = canvasRef.value
  if (!canvas || !spiralData.value.maxNum) return

  const wrap = canvas.closest('.canvas-float')
  if (!wrap) return
  const rect = wrap.getBoundingClientRect()
  if (rect.width <= 0 || rect.height <= 0) return

  const dpr = window.devicePixelRatio || 1
  const renderSize = clampRenderSize(resolution?.value ?? 1024)

  if (!offscreenCanvasRef.value || offscreenCanvasRef.value.width !== renderSize || offscreenCanvasRef.value.height !== renderSize) {
    const canvas = document.createElement('canvas')
    canvas.width = renderSize
    canvas.height = renderSize
    offscreenCanvasRef.value = canvas
    offscreenCtxRef.value = canvas.getContext('2d')
  }
  drawSpiral(offscreenCtxRef.value, renderSize, renderSize)

  canvas.width = Math.round(rect.width * dpr)
  canvas.height = Math.round(rect.height * dpr)
  const ctx = canvas.getContext('2d')
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.scale(dpr, dpr)

  ctx.fillStyle = backgroundColor.value
  ctx.fillRect(0, 0, rect.width, rect.height)

  const scale = Math.min(rect.width / renderSize, rect.height / renderSize)
  const drawW = renderSize * scale
  const drawH = renderSize * scale
  const x = (rect.width - drawW) / 2
  const y = (rect.height - drawH) / 2
  ctx.drawImage(offscreenCanvasRef.value, x, y, drawW, drawH)

  scheduleBlurBgUpdate()

  extractDominantColor(offscreenCanvasRef.value).then((accent) => {
    const vars = accentToThemeVariables(accent || '#ffffff')
    const root = document.documentElement
    for (const [key, value] of Object.entries(vars)) {
      root.style.setProperty(key, value)
    }
  })
}

const BLUR_BG_THROTTLE_MS = 300
const scheduleBlurBgUpdate = useThrottleFn(() => {
  if (!blurCanvasRef.value || !offscreenCanvasRef.value) return
  const canvas = blurCanvasRef.value
  const offscreen = offscreenCanvasRef.value
  if (canvas.width !== offscreen.width || canvas.height !== offscreen.height) {
    canvas.width = offscreen.width
    canvas.height = offscreen.height
  }
  canvas.getContext('2d').drawImage(offscreen, 0, 0)
}, BLUR_BG_THROTTLE_MS)

const SPINNER_DELAY_MS = 150

function runCompute() {
  computeGenerationRef.value += 1
  const gen = computeGenerationRef.value
  if (spinnerDelayIdRef.value) clearTimeout(spinnerDelayIdRef.value)
  spinnerDelayIdRef.value = setTimeout(() => {
    spinnerDelayIdRef.value = null
    isLoading.value = true
  }, SPINNER_DELAY_MS)
  nextTick().then(() => {
    requestAnimationFrame(() => {
      workerRef.value?.postMessage({
        maxPrime: selectedMaxPrime.value,
        numPolynomials: numPolynomials.value,
        generation: gen,
      })
    })
  })
}

const debouncedComputeAndDraw = useDebounceFn(runCompute, 80)

watch([selectedMaxPrime, numPolynomials], debouncedComputeAndDraw, { immediate: false })

watch([
  interpolationMethod, dotColor, splineColor, backgroundColor,
  radiusCircleThickness, outerBorderColor, splineThickness,
  partitionColored, numPartitions, partitionColors,
  dotShape, dotSize, transparency, resolution,
  customizeDots, customizeCurves, customizeBorder, customizeGrid, customizeTransparency,
  gridMajorDegrees, gridMinorDegrees, gridThickness, gridTicksEnabled, tickThickness, tickLength, tickColor,
], () => {
  if (spiralData.value.maxNum) requestAnimationFrame(drawCanvas)
})

const resizeDebounced = useDebounceFn(() => requestAnimationFrame(drawCanvas), 100)
let resizeObserver

function onKeydown(e) {
  if (e.key === 'Escape' && showInfoModal.value) showInfoModal.value = false
}

onMounted(() => {
  workerRef.value = new Worker(new URL('../spiralWorker.js', import.meta.url), { type: 'module' })
  workerRef.value.onmessage = applyWorkerResult
  workerRef.value.onerror = () => {
    if (spinnerDelayIdRef.value) {
      clearTimeout(spinnerDelayIdRef.value)
      spinnerDelayIdRef.value = null
    }
    isLoading.value = false
  }
  runCompute()

  const wrapEl = canvasRef.value?.closest('.canvas-float')
  if (wrapEl) {
    resizeObserver = new ResizeObserver(resizeDebounced)
    resizeObserver.observe(wrapEl)
  }
  window.addEventListener('resize', resizeDebounced)
  window.addEventListener('keydown', onKeydown)
})
onBeforeUnmount(() => {
  workerRef.value?.terminate()
  workerRef.value = null
  resizeObserver?.disconnect()
  window.removeEventListener('resize', resizeDebounced)
  window.removeEventListener('keydown', onKeydown)
})

async function downloadCanvas() {
  const canvas = canvasRef.value
  if (!canvas || !spiralData.value.maxNum) return
  const w = clampRenderSize(resolution?.value ?? 1024)
  const h = w
  const offscreen = document.createElement('canvas')
  offscreen.width = w
  offscreen.height = h
  const ctx = offscreen.getContext('2d')
  drawSpiral(ctx, w, h)

  const blob = await new Promise((resolve) =>
    offscreen.toBlob(resolve, 'image/png')
  )
  if (!blob) return
  const buf = await blob.arrayBuffer()
  const payload = settingsToPayload(settings)
  const pngWithMeta = encodeSettingsInPng(new Uint8Array(buf), payload)
  const metaBlob = new Blob([pngWithMeta], { type: 'image/png' })
  const link = document.createElement('a')
  link.download = `sacks-spiral-${selectedMaxPrime.value}.png`
  link.href = URL.createObjectURL(metaBlob)
  link.click()
  setTimeout(() => URL.revokeObjectURL(link.href), 10000)
}
</script>

<template>
  <div class="app">
    <div class="blur-bg">
      <canvas ref="blurCanvasRef" class="blur-bg-canvas" />
    </div>
    <SpiralSidebar />
    <main class="canvas-wrap">
      <div class="canvas-float">
        <canvas ref="canvasRef" />
        <div v-if="isLoading" class="loading-overlay">
          <div class="loading-spinner" />
          <span>Computing primes…</span>
        </div>
        <div class="absolute bottom-4 right-4 flex items-center gap-2">
          <UiTooltip>
            <template #trigger>
              <UiButton variant="outline" size="icon" @click="settings.randomizeSettings" aria-label="Randomize">
                <Shuffle :size="16" />
              </UiButton>
            </template>
            Randomize all settings
          </UiTooltip>
          <UiTooltip>
            <template #trigger>
              <UiButton variant="outline" @click="downloadCanvas">
                <Download :size="16" class="mr-1.5" />
                Download
              </UiButton>
            </template>
            Download PNG
          </UiTooltip>
        </div>
      </div>
      <UiButton
        variant="ghost"
        size="icon"
        class="absolute bottom-8 right-8"
        aria-label="About and attribution"
        @click="showInfoModal = true"
      >
        <Info :size="18" />
      </UiButton>
      <UiDialog v-model:open="showInfoModal">
        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <DialogTitle class="text-lg font-semibold">About the Sacks Spiral</DialogTitle>
            <DialogClose as-child>
              <UiButton variant="ghost" size="icon" aria-label="Close">×</UiButton>
            </DialogClose>
          </div>
          <DialogDescription class="sr-only">History and references for the Sacks number spiral visualization</DialogDescription>
          <div class="space-y-3 text-sm">
            <h3 class="font-semibold">Mathematical foundations</h3>
            <ul class="list-disc pl-5 space-y-1 text-muted-foreground">
              <li><strong class="text-foreground">Robert Sacks</strong> (1994) devised the Sacks spiral: a polar layout with <MathInline latex="r = \sqrt{n},\, \theta = 2\pi\sqrt{n}" />, making one rotation per perfect square. It reveals prime-rich curves along quadratic polynomials.</li>
              <li><strong class="text-foreground">Stanisław Ulam</strong> (1963) discovered the original Ulam spiral while doodling during a lecture; his square spiral sparked Sacks' variation.</li>
              <li><strong class="text-foreground">Leonhard Euler</strong> (1772) published the prime-rich polynomial <MathInline latex="n^2 - n + 41" />, which yields 40 consecutive primes and appears as a prominent curve on the Sacks spiral.</li>
            </ul>
            <h3 class="font-semibold">Inspiration and reference</h3>
            <ul class="list-disc pl-5 space-y-1 text-muted-foreground">
              <li><a href="https://majcher.net/diagramy-ulama/" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">Majcher.net – Spirale Ulama / Spirale Roberta Sacksa</a> — Blog (PL) on Ulam vs Sacks spirals, Sieve of Eratosthenes, Euler's polynomial, and "most effective" prime-rich polynomials. Also hosts <a href="https://github.com/majchernet/animated-ulam-spiral-generator" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">animated-ulam-spiral-generator</a>.</li>
              <li><a href="https://formulae.org/?script=examples/Sacks_spiral" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">Fōrmulæ – Sacks spiral example</a> — Interactive Sacks spiral in the Fōrmulæ scientific programming language.</li>
              <li><a href="https://www.naturalnumbers.org/sparticle.html" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">Natural Numbers – The Sacks Number Spiral</a> — Michael M. Ross' exploration of product curves, pronic numbers, polynomial alignment, and Robert Sacks' offset rule.</li>
            </ul>
          </div>
        </div>
      </UiDialog>
    </main>
  </div>
</template>

<style scoped>
.app {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}
.blur-bg {
  position: absolute;
  inset: 0;
  background-color: #1a1a2e;
  overflow: hidden;
  filter: blur(40px) brightness(0.35);
  z-index: 0;
  pointer-events: none;
}
.blur-bg-canvas {
  position: absolute;
  inset: 0;
  width: 140%;
  height: 140%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  object-fit: cover;
  object-position: center;
}
.canvas-wrap {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  padding-left: 290px;
  z-index: 1;
  overflow: hidden;
}
@media (max-width: 768px) {
  .canvas-wrap {
    padding-left: 2rem;
  }
}
@media (max-width: 768px) {
  .app {
    display: flex;
    flex-direction: column;
  }
  .canvas-wrap {
    position: relative;
    flex: 1;
    padding: 1rem;
    min-height: 0;
  }
}
.canvas-float {
  transition: box-shadow 0.3s ease;
  position: relative;
  width: min(calc(100vw - 310px), calc(100vh - 4rem));
  height: min(calc(100vw - 310px), calc(100vh - 4rem));
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: var(--shadow-lg), 0 0 0 1px var(--theme-accent-subtle);
}
@media (max-width: 768px) {
  .canvas-float {
    width: min(calc(100vw - 2rem), calc(100vh - 200px));
    height: min(calc(100vw - 2rem), calc(100vh - 200px));
  }
}
.canvas-wrap canvas {
  display: block;
  width: 100%;
  height: 100%;
}
.loading-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  background: rgba(0, 0, 0, 0.5);
  color: var(--text-primary);
  font-size: 0.9rem;
}
.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(255, 255, 255, 0.25);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

</style>
