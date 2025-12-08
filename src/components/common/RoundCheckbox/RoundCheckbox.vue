<template>
  <label class="checkbox-label" :class="{ disabled }" @click.stop>
    <input
        :checked="modelValue"
        type="checkbox"
        class="round-checkbox"
        :disabled="disabled"
        @change="handleChange"
        @click.stop
    />
    <span v-if="label">{{ label }}</span>
    <slot></slot>
  </label>
</template>

<script setup lang="ts">
import { withDefaults } from 'vue';
interface Props {
  modelValue: boolean;
  label?: string;
  disabled?: boolean;
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void;
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
});
const emit = defineEmits<Emits>();

const handleChange = (event: Event): void => {
  if (props.disabled) {
    return;
  }
  const target = event.target as HTMLInputElement;
  emit('update:modelValue', target.checked);
};
</script>

<style scoped src="./RoundCheckbox.css"></style>
