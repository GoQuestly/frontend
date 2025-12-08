<template>
  <div class="invite-container">
    <div class="controls">
      <LocaleToggle />
      <ThemeToggle />
    </div>

    <div class="content">
      <div class="icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M7 1C5.9 1 5 1.9 5 3v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2H7zm0 2h10v16H7V3zm5 17c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1z"/>
        </svg>
      </div>
      <h1>{{ $t('invite.title') }}</h1>
      <p class="description">{{ $t('invite.description') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import ThemeToggle from '@/components/common/ThemeToggle/ThemeToggle.vue';
import LocaleToggle from '@/components/common/LocaleToggle/LocaleToggle.vue';
</script>

<style scoped src="./InviteView.css"></style>
