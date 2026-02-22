<script setup>
import { computed } from 'vue'
import katex from 'katex'

const props = defineProps({
  /** LaTeX string to render (e.g. "r = \\sqrt{n}") */
  latex: { type: String, required: true },
  /** Display mode (block) vs inline */
  displayMode: { type: Boolean, default: false }
})

const html = computed(() => {
  if (!props.latex) return ''
  try {
    return katex.renderToString(props.latex, {
      throwOnError: false,
      displayMode: props.displayMode,
      output: 'html'
    })
  } catch {
    return props.latex
  }
})
</script>

<template>
  <span class="math-inline" v-html="html" />
</template>

<style scoped>
.math-inline {
  display: inline;
  white-space: nowrap;
}
.math-inline :deep(.katex) {
  font-size: 1em;
  vertical-align: 0;
}
</style>
