<script setup>
import { cn } from '@/lib/utils'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  modelModifiers: { type: Object, default: () => ({}) },
})
const emit = defineEmits(['update:modelValue'])

function onInput(e) {
  let val = e.target.value
  if (props.modelModifiers.number || e.target.type === 'number') {
    const num = parseFloat(val)
    if (!isNaN(num)) val = num
  }
  if (props.modelModifiers.trim && typeof val === 'string') {
    val = val.trim()
  }
  emit('update:modelValue', val)
}
</script>

<template>
  <input
    :value="modelValue"
    :class="cn(
      'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none'
    )"
    v-bind="$attrs"
    @input="onInput"
  >
</template>
