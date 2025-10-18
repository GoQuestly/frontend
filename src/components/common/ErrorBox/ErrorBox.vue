<template>
  <Transition name="error-fade">
    <div v-if="message" class="error-box">
      {{ message }}
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { errorBoxDefaults } from './ErrorBox';
import type { ErrorBoxProps } from './ErrorBox';
import './ErrorBox.css';

withDefaults(defineProps<ErrorBoxProps>(), errorBoxDefaults);
</script>