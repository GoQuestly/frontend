<template>
  <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :maxlength="maxlength"
      :inputmode="inputmode"
      :pattern="pattern"
      :min="min"
      :max="max"
      @input="handleInput"
      @keydown="handleKeydown"
      @blur="handleBlur"
      class="base-input"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  baseInputDefaults,
  handleInputLogic,
  handleKeydownLogic,
  handleBlurLogic,
  getInputMode,
  getPattern
} from './BaseInput';
import type { BaseInputProps, BaseInputEmits } from './BaseInput';
import './BaseInput.css';

const props = withDefaults(defineProps<BaseInputProps>(), baseInputDefaults);

const emit = defineEmits<BaseInputEmits>();

const inputmode = computed(() => getInputMode(props.numbersOnly));

const pattern = computed(() => getPattern(props.numbersOnly));

const handleInput = (event: Event): void => {
  handleInputLogic(event, props.numbersOnly, emit);
};

const handleKeydown = (event: KeyboardEvent): void => {
  handleKeydownLogic(event, props.numbersOnly);
};

const handleBlur = (): void => {
  if (!props.numbersOnly) return;
  handleBlurLogic(props.modelValue ?? '', emit, props.min, props.max);
};
</script>

<style scoped src="./BaseInput.css"></style>
