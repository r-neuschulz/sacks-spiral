<script setup>
import {
  SliderRoot,
  SliderTrack,
  SliderRange,
  SliderThumb,
} from 'reka-ui'
import { computed } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps({
  modelValue: { type: [Number, Array], default: 0 },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  step: { type: [Number, String], default: 1 },
  disabled: { type: Boolean, default: false },
})
const emit = defineEmits(['update:modelValue'])

const internalValue = computed(() => {
  const v = props.modelValue
  return Array.isArray(v) ? v : [Number(v) || 0]
})

function onUpdate(val) {
  emit('update:modelValue', Array.isArray(props.modelValue) ? val : val[0])
}
</script>

<template>
  <SliderRoot
    :model-value="internalValue"
    :min="min"
    :max="max"
    :step="Number(step)"
    :disabled="disabled"
    class="relative flex w-full min-w-0 touch-none select-none items-center"
    @update:model-value="onUpdate"
  >
    <SliderTrack
      :class="cn('relative h-1.5 w-full grow overflow-hidden rounded-full bg-primary/20')"
    >
      <SliderRange
        :class="cn('absolute h-full bg-primary')"
      />
    </SliderTrack>
    <SliderThumb
      :class="cn(
        'block h-4 w-4 shrink-0 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
      )"
    />
  </SliderRoot>
</template>
