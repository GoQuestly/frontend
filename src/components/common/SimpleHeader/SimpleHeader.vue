<template>
  <header class="simple-header">
    <div class="simple-header-container">
      <router-link :to="HEADER_CONFIG.homeRoute" class="logo-link">
        <img :src="HEADER_CONFIG.logoSrc" :alt="HEADER_CONFIG.logoAlt" class="logo-icon" />
        <span class="logo-text">{{ HEADER_CONFIG.logoText }}</span>
      </router-link>

      <div class="header-actions">
        <ThemeToggle />
        <LocaleToggle />
        <LogoutButton />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import ThemeToggle from '@/components/common/ThemeToggle/ThemeToggle.vue';
import LocaleToggle from '@/components/common/LocaleToggle/LocaleToggle.vue';
import LogoutButton from '@/components/common/LogoutButton/LogoutButton.vue';
import { HEADER_CONFIG } from './SimpleHeader';
import './SimpleHeader.css';
</script>