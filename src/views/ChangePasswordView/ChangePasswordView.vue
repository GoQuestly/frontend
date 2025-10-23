<template>
  <div class="new-password-view">
    <div class="controls">
      <LocaleToggle/>
      <ThemeToggle/>
    </div>
    <ChangePasswordForm/>
  </div>
</template>

<script setup lang="ts">
import ChangePasswordForm from '@/components/features/auth/ChangePasswordForm/ChangePasswordForm.vue';
import LocaleToggle from '@/components/common/LocaleToggle/LocaleToggle.vue';
import ThemeToggle from '@/components/common/ThemeToggle/ThemeToggle.vue';
</script>

<style src="./ChangePasswordView.css" scoped></style>