<script setup>
import {
  ScrollAreaRoot,
  ScrollAreaViewport,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
} from 'reka-ui'
import { cn } from '@/lib/utils'
</script>

<template>
  <ScrollAreaRoot
    :class="cn('relative overflow-hidden')"
    v-bind="$attrs"
  >
    <ScrollAreaViewport
      :class="cn('h-full w-full rounded-[inherit]')"
    >
      <slot />
    </ScrollAreaViewport>
    <ScrollAreaScrollbar
      orientation="vertical"
      :class="cn('flex touch-none select-none transition-colors h-full w-2.5 border-l border-l-transparent p-px')"
    >
      <ScrollAreaThumb
        :class="cn('relative flex-1 rounded-full bg-border')"
      />
    </ScrollAreaScrollbar>
  </ScrollAreaRoot>
</template>
