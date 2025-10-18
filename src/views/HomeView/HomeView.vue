<template>
  <div class="home-container">
    <div class="controls">
      <LocaleToggle />
      <ThemeToggle />
    </div>

    <div class="content">
      <h1>{{ $t('home.title') }}</h1>
      <p>{{ $t('home.subtitle') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import ThemeToggle from '@/components/common/ThemeToggle/ThemeToggle.vue';
import LocaleToggle from '@/components/common/LocaleToggle/LocaleToggle.vue';
</script>

<style scoped src="./HomeView.css"></style>