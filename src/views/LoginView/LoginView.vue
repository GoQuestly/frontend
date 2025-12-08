<template>
  <div class="login-container">
    <div class="controls">
      <LocaleToggle />
      <ThemeToggle />
    </div>

    <div class="login-illustration">
      <img :src="loginIllustration" alt="Traveler illustration" />
    </div>

    <LoginForm />
  </div>
</template>

<script setup lang="ts">
import LoginForm from '@/components/features/auth/LoginForm/LoginForm.vue';
import ThemeToggle from '@/components/common/ThemeToggle/ThemeToggle.vue';
import LocaleToggle from '@/components/common/LocaleToggle/LocaleToggle.vue';
import { loginIllustration } from '@/assets/images';
import './LoginView.css';
</script>