<script setup>
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
} from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps({
  open: { type: Boolean, default: undefined },
})
const emit = defineEmits(['update:open'])
</script>

<template>
  <DialogRoot
    :open="open"
    @update:open="emit('update:open', $event)"
  >
    <slot name="trigger" />
    <DialogPortal>
      <DialogOverlay
        :class="cn(
          'fixed inset-0 z-50 bg-black/80'
        )"
      />
      <DialogContent
        :class="cn(
          'fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg'
        )"
      >
        <slot />
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
