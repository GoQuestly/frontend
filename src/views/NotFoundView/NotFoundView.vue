<template>
  <div class="not-found-container">
    <div class="controls">
      <LocaleToggle />
      <ThemeToggle />
    </div>

    <div class="content">
      <h1>404</h1>
      <p>{{ $t('notFound.message') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import ThemeToggle from '@/components/common/ThemeToggle/ThemeToggle.vue';
import LocaleToggle from '@/components/common/LocaleToggle/LocaleToggle.vue';
</script>

<style scoped src="./NotFoundView.css"></style>