<template>
  <div class="verify-email-view">
    <SimpleHeader />
    <main class="verify-email-main">
      <VerifyEmailForm />
    </main>
  </div>
</template>

<script setup lang="ts">
import SimpleHeader from '@/components/common/SimpleHeader/SimpleHeader.vue';
import VerifyEmailForm from '@/components/features/auth/VerifyEmailForm/VerifyEmailForm.vue';
import './VerifyEmailView.css';
</script>