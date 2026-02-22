<script setup>
import 'vanilla-colorful/hex-color-picker.js'
import { ref, watch, nextTick } from 'vue'
import UiPopover from './ui/popover.vue'

const props = defineProps({
  modelValue: { type: String, default: '#ffffff' },
})
const emit = defineEmits(['update:modelValue'])

const isOpen = ref(false)
const pickerRef = ref(null)
const hexEditMode = ref(false)
const hexInputRef = ref(null)
const hexInputValue = ref('')

function handleColorChange(e) {
  emit('update:modelValue', e.detail.value)
}

function startHexEdit() {
  hexEditMode.value = true
  hexInputValue.value = props.modelValue
  nextTick(() => hexInputRef.value?.select())
}

function commitHexEdit() {
  const val = hexInputValue.value.trim()
  const hex = /^#[0-9A-Fa-f]{6}$/.test(val) ? val : /^[0-9A-Fa-f]{6}$/.test(val) ? `#${val}` : null
  if (hex) emit('update:modelValue', hex)
  hexEditMode.value = false
}

function cancelHexEdit() {
  hexEditMode.value = false
}

watch([isOpen, pickerRef], async ([open, picker]) => {
  if (open && picker) {
    await nextTick()
    picker.color = props.modelValue
  }
})

watch(() => props.modelValue, () => {
  if (pickerRef.value) pickerRef.value.color = props.modelValue
})
</script>

<template>
  <div class="flex items-center gap-2.5 h-9">
    <UiPopover v-model:open="isOpen">
      <template #trigger>
        <button
          type="button"
          class="w-7 h-7 shrink-0 rounded-md border-2 border-white/20 shadow-inner cursor-pointer"
          :style="{ backgroundColor: modelValue }"
          :aria-label="`Pick color: ${modelValue}`"
        />
      </template>
      <hex-color-picker
        ref="pickerRef"
        @color-changed="handleColorChange"
      />
    </UiPopover>
    <span
      v-if="!hexEditMode"
      class="text-xs font-mono text-muted-foreground cursor-text px-1.5 py-0.5 rounded hover:bg-accent hover:text-accent-foreground select-all"
      @click="startHexEdit"
    >
      {{ modelValue }}
    </span>
    <input
      v-else
      ref="hexInputRef"
      v-model="hexInputValue"
      type="text"
      class="w-20 text-xs font-mono px-1.5 py-0.5 rounded border border-input bg-background outline-none focus:ring-2 focus:ring-ring"
      @blur="commitHexEdit"
      @keydown.enter="commitHexEdit"
      @keydown.escape="cancelHexEdit"
    >
  </div>
</template>
