<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import ColorPicker from './ColorPicker.vue'
import { extractSettingsFromPng } from '../utils/pngMetadata.js'
import { useSettingsStore } from '../stores/settings.js'
import { getInterpolationNames } from '../interpolation.js'
import {
  PRIMES_MIN,
  PRIMES_MAX,
  POLY_MIN,
  POLY_MAX,
  RADIUS_THICKNESS_MAX,
  SPLINE_THICKNESS_MAX,
  DOT_SIZE_MIN,
  DOT_SIZE_MAX,
  RENDER_SIZE_MIN,
  RENDER_SIZE_MAX,
  LARGE_PRIME_THRESHOLD,
  PARTITIONS_MIN,
  PARTITIONS_MAX,
  GRID_SECTIONS_MIN,
  GRID_SECTIONS_MAX,
  GRID_MAJOR_DEGREES_MIN,
  GRID_MAJOR_DEGREES_MAX,
  GRID_MINOR_DEGREES_MIN,
  GRID_MINOR_DEGREES_MAX,
  GRID_THICKNESS_MIN,
  GRID_THICKNESS_MAX,
  TICK_THICKNESS_MIN,
  TICK_THICKNESS_MAX,
  TICK_LENGTH_MIN,
  TICK_LENGTH_MAX,
  maxPrimePresets,
  dotShapeOptions,
} from '../constants.js'
import UiButton from './ui/button.vue'
import UiLabel from './ui/label.vue'
import UiInput from './ui/input.vue'
import UiSlider from './ui/slider.vue'
import UiSelect from './ui/select.vue'
import UiSwitch from './ui/switch.vue'
import UiCollapsible from './ui/collapsible.vue'
import UiScrollArea from './ui/scroll-area.vue'
import UiSeparator from './ui/separator.vue'
import UiBadge from './ui/badge.vue'
import UiToggleGroup from './ui/toggle-group.vue'
import UiToggleGroupItem from './ui/toggle-group-item.vue'
import MathInline from './MathInline.vue'
import { CollapsibleContent, CollapsibleTrigger } from 'reka-ui'
import { ChevronDown } from 'lucide-vue-next'

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

const interpolationOptions = getInterpolationNames()

const n = computed(() => Math.ceil(Math.sqrt(selectedMaxPrime.value)))

function setPartitionColor(i, color) {
  const arr = [...partitionColors.value]
  arr[i] = color
  settings.partitionColors = arr
}

const DEFAULT_PARTITION_COLORS = ['#004990', '#1a5fa3', '#004990', '#1a5fa3']

function syncPartitionColorsToCount() {
  const nVal = Math.max(GRID_SECTIONS_MIN, Math.min(GRID_SECTIONS_MAX, numPartitions.value))
  let arr = [...(partitionColors.value || DEFAULT_PARTITION_COLORS)]
  while (arr.length < nVal) {
    const prev = arr[arr.length - 1]
    arr.push(prev ?? DEFAULT_PARTITION_COLORS[(arr.length - 1) % DEFAULT_PARTITION_COLORS.length])
  }
  if (arr.length > nVal) arr = arr.slice(0, nVal)
  settings.partitionColors = arr
}

watch(numPartitions, syncPartitionColorsToCount, { immediate: true })
const largePrimeWarning = computed(() => selectedMaxPrime.value >= LARGE_PRIME_THRESHOLD)

const importInputRef = ref(null)
const importError = ref(null)
const customizeExpanded = ref(false)

function triggerImportPng() {
  importError.value = null
  importInputRef.value?.click()
}

async function onImportPngChange(ev) {
  const file = ev.target.files?.[0]
  if (!file) return
  ev.target.value = ''
  importError.value = null
  try {
    const buf = await file.arrayBuffer()
    const payload = extractSettingsFromPng(buf)
    if (!payload) {
      importError.value = 'No Sacks Spiral settings found in this PNG.'
      return
    }
    settings.applyImportedSettings(payload)
  } catch (err) {
    importError.value = err?.message ?? 'Failed to read PNG.'
  }
}

</script>

<template>
  <nav class="fixed left-4 top-4 bottom-4 w-[260px] flex flex-col gap-3 z-10 max-md:left-2 max-md:top-2 max-md:bottom-2 max-md:w-[240px]">
    <!-- Card 1: Header -->
    <div class="rounded-xl border border-border bg-card/95 backdrop-blur-xl p-4 shadow-lg shrink-0">
      <h1 class="text-lg font-semibold">
        <a
          href="https://github.com/r-neuschulz/ulam-spiral"
          target="_blank"
          rel="noopener noreferrer"
          class="text-foreground hover:text-primary hover:underline focus:outline-none focus:ring-2 focus:ring-ring rounded"
        >
          Sacks Spiral
        </a>
      </h1>
      <p class="text-xs text-muted-foreground mt-1 flex flex-wrap items-baseline gap-x-2">
        <span>Polar layout (<MathInline latex="r = \sqrt{n},\, \theta = 2\pi\sqrt{n}" />) revealing prime-rich curves along quadratic polynomials.</span>
        <span class="ml-auto shrink-0 flex items-center gap-2">
          <input
            ref="importInputRef"
            type="file"
            accept=".png,image/png"
            class="hidden"
            @change="onImportPngChange"
          />
          <button
            type="button"
            class="text-primary hover:underline text-xs"
            @click="triggerImportPng"
          >
            Import PNG
          </button>
          ·
          <a
            href="https://github.com/r-neuschulz/ulam-spiral"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary hover:underline"
          >Source</a>
          </span>
      </p>
      <p v-if="importError" class="text-xs text-destructive mt-1">{{ importError }}</p>
    </div>

    <!-- Card 2: Settings (scrollable) -->
    <div class="rounded-xl border border-border bg-card/95 backdrop-blur-xl pl-4 pt-4 pb-4 pr-0 shadow-lg flex-1 min-h-0 flex flex-col">
      <UiScrollArea class="flex-1 py-3 pr-4">
        <div class="space-y-4">
          <!-- Spiral data -->
          <div class="space-y-2">
            <UiLabel class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Spiral data</UiLabel>
            <div class="space-y-2">
              <UiLabel class="text-xs">Primes up to</UiLabel>
                <div class="flex items-center gap-2">
                  <UiSlider v-model="selectedMaxPrime" :min="PRIMES_MIN" :max="PRIMES_MAX" :step="100" class="min-w-0 flex-[2]" />
                  <UiInput v-model.number="selectedMaxPrime" type="number" :min="PRIMES_MIN" :max="PRIMES_MAX" class="min-w-0 flex-[1] w-0 h-7 px-1.5 py-0.5 text-right text-sm tabular-nums" />
                </div>
              <div class="flex flex-wrap gap-1">
                <UiToggleGroup
                  :model-value="String(selectedMaxPrime)"
                  type="single"
                  @update:model-value="selectedMaxPrime = Number($event)"
                >
                  <UiToggleGroupItem v-for="p in maxPrimePresets" :key="p" :value="String(p)">
                    {{ (p / 1000).toFixed(0) }}k
                  </UiToggleGroupItem>
                </UiToggleGroup>
              </div>
            </div>
            <div class="space-y-2">
              <UiLabel class="text-xs">Polynomials</UiLabel>
              <div class="flex items-center gap-2">
                <UiSlider v-model="numPolynomials" :min="POLY_MIN" :max="POLY_MAX" class="min-w-0 flex-[2]" />
                <UiInput v-model.number="numPolynomials" type="number" :min="POLY_MIN" :max="POLY_MAX" class="min-w-0 flex-[1] w-0 h-7 px-1.5 py-0.5 text-right text-sm tabular-nums" />
              </div>
            </div>
            <div class="space-y-2">
              <UiLabel class="text-xs">Interpolation</UiLabel>
              <UiSelect v-model="interpolationMethod" :options="interpolationOptions" placeholder="Select…" />
            </div>
            <p v-if="largePrimeWarning" class="text-xs text-amber-500/90 bg-amber-500/10 p-2 rounded-md">
              Large range may cause slow rendering.
            </p>
          </div>

          <!-- Image size -->
          <div class="space-y-2">
            <UiLabel class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Image size</UiLabel>
            <div class="flex items-center gap-2">
              <UiSlider v-model="resolution" :min="RENDER_SIZE_MIN" :max="RENDER_SIZE_MAX" :step="64" class="min-w-0 flex-[2]" />
              <div class="flex flex-[1] min-w-0 items-center gap-0.5">
                <UiInput v-model.number="resolution" type="number" :min="RENDER_SIZE_MIN" :max="RENDER_SIZE_MAX" class="min-w-0 flex-1 w-0 h-7 px-1.5 py-0.5 text-right text-sm tabular-nums" />
                <span class="shrink-0 text-sm text-muted-foreground">×</span>
              </div>
            </div>
          </div>

          <!-- Canvas (background) -->
          <div class="space-y-2">
            <UiLabel class="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Canvas</UiLabel>
            <div class="space-y-2">
              <UiLabel class="text-xs">Background</UiLabel>
              <ColorPicker v-model="backgroundColor" />
            </div>
          </div>

          <UiSeparator />

          <!-- Customize (collapsed by default for minimal UI) -->
          <UiCollapsible v-model:open="customizeExpanded" class="space-y-3">
            <CollapsibleTrigger
              class="group flex w-full items-center justify-between rounded-md py-2 px-2 text-left text-sm font-medium hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <UiLabel class="!mb-0 text-xs font-semibold uppercase tracking-wider text-muted-foreground cursor-pointer">Customize appearance</UiLabel>
              <ChevronDown class="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent class="space-y-3 overflow-hidden">
            <!-- Customize dots -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <UiLabel class="!mb-0 text-xs">Dots</UiLabel>
                <UiSwitch v-model="customizeDots" />
              </div>
              <UiCollapsible v-model:open="customizeDots" class="space-y-2 pl-1 border-l-2 border-border ml-1">
                <CollapsibleContent class="space-y-2 overflow-hidden">
                  <div class="space-y-2">
                    <UiLabel class="text-xs">Shape</UiLabel>
                    <UiSelect v-model="dotShape" :options="dotShapeOptions" item-value="value" item-label="label" />
                  </div>
                  <div class="space-y-2">
                    <UiLabel class="text-xs">Size</UiLabel>
                    <div class="flex items-center gap-2">
                      <UiSlider v-model="dotSize" :min="DOT_SIZE_MIN" :max="DOT_SIZE_MAX" :step="0.5" class="min-w-0 flex-[2]" />
                      <UiInput v-model.number="dotSize" type="number" :min="DOT_SIZE_MIN" :max="DOT_SIZE_MAX" step="0.5" class="min-w-0 flex-[1] w-0 h-7 px-1.5 py-0.5 text-right text-sm tabular-nums" />
                    </div>
                  </div>
                  <div class="space-y-2">
                    <UiLabel class="text-xs">Color</UiLabel>
                    <ColorPicker v-model="dotColor" />
                  </div>
                </CollapsibleContent>
              </UiCollapsible>
            </div>

            <!-- Customize curves -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <UiLabel class="!mb-0 text-xs">Curves</UiLabel>
                <UiSwitch v-model="customizeCurves" />
              </div>
              <UiCollapsible v-model:open="customizeCurves" class="space-y-2 pl-1 border-l-2 border-border ml-1">
                <CollapsibleContent class="space-y-2 overflow-hidden">
                  <div class="space-y-2">
                    <UiLabel class="text-xs">Spline color</UiLabel>
                    <ColorPicker v-model="splineColor" />
                  </div>
                  <div class="space-y-2">
                    <UiLabel class="text-xs">Spline thickness</UiLabel>
                    <div class="flex items-center gap-2">
                      <UiSlider v-model="splineThickness" :min="0.5" :max="SPLINE_THICKNESS_MAX" :step="0.25" class="min-w-0 flex-[2]" />
                      <UiInput v-model.number="splineThickness" type="number" :min="0.5" :max="SPLINE_THICKNESS_MAX" step="0.25" class="min-w-0 flex-[1] w-0 h-7 px-1.5 py-0.5 text-right text-sm tabular-nums" />
                    </div>
                  </div>
                </CollapsibleContent>
              </UiCollapsible>
            </div>

            <!-- Outer border -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <UiLabel class="!mb-0 text-xs">Outer border</UiLabel>
                <UiSwitch v-model="customizeBorder" />
              </div>
              <UiCollapsible v-model:open="customizeBorder" class="space-y-2 pl-1 border-l-2 border-border ml-1">
                <CollapsibleContent class="space-y-2 overflow-hidden">
                  <div class="space-y-2">
                    <UiLabel class="text-xs">Thickness</UiLabel>
                    <div class="flex items-center gap-2">
                      <UiSlider v-model="radiusCircleThickness" :min="0" :max="RADIUS_THICKNESS_MAX" :step="0.5" class="min-w-0 flex-[2]" />
                      <UiInput v-model.number="radiusCircleThickness" type="number" :min="0" :max="RADIUS_THICKNESS_MAX" step="0.5" class="min-w-0 flex-[1] w-0 h-7 px-1.5 py-0.5 text-right text-sm tabular-nums" />
                    </div>
                  </div>
                  <div class="space-y-2">
                    <UiLabel class="text-xs">Color</UiLabel>
                    <ColorPicker v-model="outerBorderColor" />
                  </div>
                </CollapsibleContent>
              </UiCollapsible>
            </div>

            <!-- Grid -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <UiLabel class="!mb-0 text-xs">Grid</UiLabel>
                <UiSwitch v-model="customizeGrid" />
              </div>
              <UiCollapsible v-model:open="customizeGrid" class="space-y-2 pl-1 border-l-2 border-border ml-1">
                <CollapsibleContent class="space-y-2 overflow-hidden">
                  <div class="space-y-2">
                    <UiLabel class="text-xs">Sections</UiLabel>
                    <div class="flex items-center gap-2">
                      <UiSlider v-model="numPartitions" :min="GRID_SECTIONS_MIN" :max="GRID_SECTIONS_MAX" class="min-w-0 flex-[2]" />
                      <UiInput v-model.number="numPartitions" type="number" :min="GRID_SECTIONS_MIN" :max="GRID_SECTIONS_MAX" class="min-w-0 flex-[1] w-0 h-7 px-1.5 py-0.5 text-right text-sm tabular-nums" />
                    </div>
                    <p class="text-xs text-muted-foreground">Number of angular sections</p>
                  </div>
                  <div class="space-y-2">
                    <UiLabel class="text-xs">Major grid (°)</UiLabel>
                    <div class="flex items-center gap-2">
                      <UiSlider v-model="gridMajorDegrees" :min="GRID_MAJOR_DEGREES_MIN" :max="GRID_MAJOR_DEGREES_MAX" :step="15" class="min-w-0 flex-[2]" />
                      <div class="flex flex-[1] min-w-0 items-center gap-0.5">
                        <UiInput v-model.number="gridMajorDegrees" type="number" :min="GRID_MAJOR_DEGREES_MIN" :max="GRID_MAJOR_DEGREES_MAX" :step="15" class="min-w-0 flex-1 w-0 h-7 px-1.5 py-0.5 text-right text-sm tabular-nums" />
                        <span class="shrink-0 text-sm text-muted-foreground">°</span>
                      </div>
                    </div>
                    <p class="text-xs text-muted-foreground">Draw line every N degrees</p>
                  </div>
                  <div class="space-y-2">
                    <UiLabel class="text-xs">Minor grid (°)</UiLabel>
                    <div class="flex items-center gap-2">
                      <UiSlider v-model="gridMinorDegrees" :min="GRID_MINOR_DEGREES_MIN" :max="GRID_MINOR_DEGREES_MAX" :step="5" class="min-w-0 flex-[2]" />
                      <div class="flex flex-[1] min-w-0 items-center gap-0.5">
                        <UiInput v-model.number="gridMinorDegrees" type="number" :min="GRID_MINOR_DEGREES_MIN" :max="GRID_MINOR_DEGREES_MAX" :step="5" class="min-w-0 flex-1 w-0 h-7 px-1.5 py-0.5 text-right text-sm tabular-nums" />
                        <span class="shrink-0 text-sm text-muted-foreground">°</span>
                      </div>
                    </div>
                    <p class="text-xs text-muted-foreground">Finer lines every N degrees</p>
                  </div>
                  <div class="space-y-2">
                    <UiLabel class="text-xs">Grid thickness</UiLabel>
                    <div class="flex items-center gap-2">
                      <UiSlider v-model="gridThickness" :min="GRID_THICKNESS_MIN" :max="GRID_THICKNESS_MAX" :step="0.25" class="min-w-0 flex-[2]" />
                      <UiInput v-model.number="gridThickness" type="number" :min="GRID_THICKNESS_MIN" :max="GRID_THICKNESS_MAX" step="0.25" class="min-w-0 flex-[1] w-0 h-7 px-1.5 py-0.5 text-right text-sm tabular-nums" />
                    </div>
                  </div>
                  <div class="space-y-2">
                    <div class="flex items-center justify-between">
                      <UiLabel class="!mb-0 text-xs">Color sections</UiLabel>
                      <UiSwitch v-model="partitionColored" />
                    </div>
                    <p class="text-xs text-muted-foreground">Fill sections with colors</p>
                  </div>
                  <div v-if="partitionColored" class="space-y-2">
                    <div v-for="(_, i) in partitionColors" :key="i" class="space-y-1">
                      <UiLabel class="text-xs">Section {{ i + 1 }}</UiLabel>
                      <ColorPicker :model-value="partitionColors[i]" @update:model-value="(v) => setPartitionColor(i, v)" />
                    </div>
                  </div>
                </CollapsibleContent>
              </UiCollapsible>
            </div>

            <!-- Ticks -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <UiLabel class="!mb-0 text-xs">Ticks</UiLabel>
                <UiSwitch v-model="gridTicksEnabled" />
              </div>
              <UiCollapsible v-model:open="gridTicksEnabled" class="space-y-2 pl-1 border-l-2 border-border ml-1">
                <CollapsibleContent class="space-y-2 overflow-hidden">
                  <p class="text-xs text-muted-foreground">Tick marks at grid angles on the circumference</p>
                  <div class="space-y-2">
                    <UiLabel class="text-xs">Tick thickness</UiLabel>
                    <div class="flex items-center gap-2">
                      <UiSlider v-model="tickThickness" :min="TICK_THICKNESS_MIN" :max="TICK_THICKNESS_MAX" :step="0.25" class="min-w-0 flex-[2]" />
                      <UiInput v-model.number="tickThickness" type="number" :min="TICK_THICKNESS_MIN" :max="TICK_THICKNESS_MAX" step="0.25" class="min-w-0 flex-[1] w-0 h-7 px-1.5 py-0.5 text-right text-sm tabular-nums" />
                    </div>
                  </div>
                  <div class="space-y-2">
                    <UiLabel class="text-xs">Tick length</UiLabel>
                    <div class="flex items-center gap-2">
                      <UiSlider v-model="tickLength" :min="TICK_LENGTH_MIN" :max="TICK_LENGTH_MAX" :step="1" class="min-w-0 flex-[2]" />
                      <UiInput v-model.number="tickLength" type="number" :min="TICK_LENGTH_MIN" :max="TICK_LENGTH_MAX" class="min-w-0 flex-[1] w-0 h-7 px-1.5 py-0.5 text-right text-sm tabular-nums" />
                    </div>
                  </div>
                  <div class="space-y-2">
                    <UiLabel class="text-xs">Tick color</UiLabel>
                    <ColorPicker v-model="tickColor" />
                  </div>
                </CollapsibleContent>
              </UiCollapsible>
            </div>

            <!-- Transparency -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <UiLabel class="!mb-0 text-xs">Transparency</UiLabel>
                <UiSwitch v-model="customizeTransparency" />
              </div>
              <UiCollapsible v-model:open="customizeTransparency" class="space-y-2 pl-1 border-l-2 border-border ml-1">
                <CollapsibleContent class="space-y-2 overflow-hidden">
                  <div class="space-y-2">
                    <UiLabel class="text-xs">Amount</UiLabel>
                    <div class="flex items-center gap-2">
                      <UiSlider v-model="transparency" :min="0" :max="100" :step="5" class="min-w-0 flex-[2]" />
                      <div class="flex flex-[1] min-w-0 items-center gap-0.5">
                        <UiInput v-model.number="transparency" type="number" :min="0" :max="100" :step="5" class="min-w-0 flex-1 w-0 h-7 px-1.5 py-0.5 text-right text-sm tabular-nums" />
                        <span class="shrink-0 text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </UiCollapsible>
            </div>
            </CollapsibleContent>
          </UiCollapsible>

          <UiBadge variant="secondary" class="w-fit text-muted-foreground font-normal">
            {{ selectedMaxPrime.toLocaleString() }} numbers, n={{ n }}
          </UiBadge>
        </div>
      </UiScrollArea>
    </div>
  </nav>
</template>
