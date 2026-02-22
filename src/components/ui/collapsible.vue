<script setup>
import { CollapsibleRoot } from 'reka-ui'

defineOptions({ inheritAttrs: false })
</script>

<template>
  <CollapsibleRoot v-bind="$attrs">
    <slot />
  </CollapsibleRoot>
</template>
