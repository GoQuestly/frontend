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
      @input="handleInput"
      @keypress="handleKeypress"
      class="base-input"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
  baseInputDefaults,
  handleInputLogic,
  handleKeypressLogic,
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

const handleKeypress = (event: KeyboardEvent): void => {
  handleKeypressLogic(event, props.numbersOnly);
};
</script>

<style scoped src="./BaseInput.css"></style>