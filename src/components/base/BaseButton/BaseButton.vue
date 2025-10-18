<template>
  <button
      :type="type"
      :class="['base-btn', variant]"
      :disabled="disabled"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { baseButtonDefaults } from './BaseButton';
import type { BaseButtonProps } from './BaseButton';
import './BaseButton.css';

withDefaults(defineProps<BaseButtonProps>(), baseButtonDefaults);
</script>