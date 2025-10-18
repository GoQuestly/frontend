<template>
  <div class="register-container">
    <div class="controls">
      <LocaleToggle />
      <ThemeToggle />
    </div>
    <RegisterForm />
  </div>
</template>

<script setup lang="ts">
import RegisterForm from '@/components/features/auth/RegisterForm/RegisterForm.vue';
import ThemeToggle from '@/components/common/ThemeToggle/ThemeToggle.vue';
import LocaleToggle from '@/components/common/LocaleToggle/LocaleToggle.vue';
import './RegisterView.css';
</script>