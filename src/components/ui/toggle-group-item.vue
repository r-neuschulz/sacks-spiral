<script setup>
import { ToggleGroupItem } from 'reka-ui'
import { cn } from '@/lib/utils'

defineProps({
  value: { type: [String, Number], required: true },
  disabled: { type: Boolean, default: false },
})
</script>

<template>
  <ToggleGroupItem
    v-bind="$attrs"
    :value="value"
    :class="cn(
      'inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground'
    )"
  >
    <slot />
  </ToggleGroupItem>
</template>
