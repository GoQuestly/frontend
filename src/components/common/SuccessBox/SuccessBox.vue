<template>
  <Transition name="success-fade">
    <div v-if="message" class="success-box">
      {{ message }}
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { successBoxDefaults } from './SuccessBox';
import type { SuccessBoxProps } from './SuccessBox';
import './SuccessBox.css';

withDefaults(defineProps<SuccessBoxProps>(), successBoxDefaults);
</script>