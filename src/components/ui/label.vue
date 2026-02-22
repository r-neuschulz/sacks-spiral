<script setup>
import { Label } from 'reka-ui'
import { cn } from '@/lib/utils'
</script>

<template>
  <Label
    :class="cn('text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-muted-foreground')"
  >
    <slot />
  </Label>
</template>
