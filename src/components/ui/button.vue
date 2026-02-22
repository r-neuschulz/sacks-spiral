<script setup>
import { cn } from '@/lib/utils'
import { useAttrs } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps({
  variant: { type: String, default: 'default' },
  size: { type: String, default: 'default' },
})

const attrs = useAttrs()

const variantClasses = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  link: 'text-primary underline-offset-4 hover:underline',
}
const sizeClasses = {
  default: 'h-9 px-4 py-2',
  sm: 'h-8 rounded-md px-3 text-xs',
  lg: 'h-10 rounded-md px-8',
  icon: 'h-9 w-9',
}
</script>

<template>
  <button
    v-bind="attrs"
    :class="cn(
      'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer',
      variantClasses[variant] || variantClasses.default,
      sizeClasses[size] || sizeClasses.default,
      attrs.class
    )"
  >
    <slot />
  </button>
</template>
