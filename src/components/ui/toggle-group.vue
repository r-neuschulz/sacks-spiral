<script setup>
import { ToggleGroupRoot, ToggleGroupItem } from 'reka-ui'
import { cn } from '@/lib/utils'

defineProps({
  type: { type: String, default: 'single' },
  modelValue: { type: [String, Array], default: '' },
})
const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <ToggleGroupRoot
    :model-value="modelValue"
    :type="type"
    class="inline-flex items-center gap-1 rounded-md p-0.5"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <slot />
  </ToggleGroupRoot>
</template>
