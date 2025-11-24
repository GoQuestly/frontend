<template>
  <label class="checkbox-label" @click.stop>
    <input
        :checked="modelValue"
        type="checkbox"
        class="round-checkbox"
        @change="handleChange"
        @click.stop
    />
    <span v-if="label">{{ label }}</span>
    <slot></slot>
  </label>
</template>

<script setup lang="ts">
interface Props {
  modelValue: boolean;
  label?: string;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const handleChange = (event: Event): void => {
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.checked);
};
</script>

<style scoped src="./RoundCheckbox.css"></style>