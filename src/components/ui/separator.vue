<script setup>
import { Separator } from 'reka-ui'
import { cn } from '@/lib/utils'

defineProps({
  orientation: { type: String, default: 'horizontal' },
})
</script>

<template>
  <Separator
    :class="cn(
      'shrink-0 bg-border',
      orientation === 'horizontal' ? 'h-[1px] w-full' : 'h-full w-[1px]'
    )"
  />
</template>
