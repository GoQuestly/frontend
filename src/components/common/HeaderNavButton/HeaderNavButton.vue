<template>
  <button
      :class="['header-nav-button', { active }]"
      @click="emit('click')"
  >
    {{ label }}
  </button>
</template>

<script setup lang="ts">
import { headerNavButtonDefaults } from './HeaderNavButton';
import type { HeaderNavButtonProps, HeaderNavButtonEmits } from './HeaderNavButton';
import './HeaderNavButton.css';

withDefaults(defineProps<HeaderNavButtonProps>(), headerNavButtonDefaults);

const emit = defineEmits<HeaderNavButtonEmits>();
</script>