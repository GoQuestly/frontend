<template>
  <div class="reset-password-view">
    <div class="controls">
      <LocaleToggle/>
      <ThemeToggle/>
    </div>
    <ResetPasswordForm/>
  </div>
</template>
<script setup lang="ts">
import ResetPasswordForm from '@/components/features/auth/ResetPasswordForm/ResetPasswordForm.vue';
import LocaleToggle from '@/components/common/LocaleToggle/LocaleToggle.vue';
import ThemeToggle from '@/components/common/ThemeToggle/ThemeToggle.vue';
</script>
<style src="./ResetPasswordView.css" scoped></style>