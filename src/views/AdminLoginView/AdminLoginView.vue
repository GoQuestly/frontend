<template>
  <div class="admin-login-view">
    <div class="toggles-container">
      <ThemeToggle />
      <LocaleToggle />
    </div>

    <div class="admin-login-container">
      <div class="admin-login-card">
        <div class="admin-header">
          <h1 class="admin-title">{{ $t('admin.login.title') }}</h1>
          <p class="admin-subtitle">{{ $t('admin.login.subtitle') }}</p>
        </div>

        <form @submit.prevent="handleSubmit" class="admin-form">
          <ErrorBox :message="errorMessage" />

          <div class="form-field">
            <label class="field-label">{{ $t('common.email') }}</label>
            <BaseInput
              v-model="email"
              type="email"
              :placeholder="$t('common.emailPlaceholder')"
              required
              :disabled="isLoading"
            />
          </div>

          <div class="form-field">
            <label class="field-label">{{ $t('common.password') }}</label>
            <BaseInput
              v-model="password"
              type="password"
              :placeholder="$t('common.passwordPlaceholder')"
              required
              :disabled="isLoading"
            />
          </div>

          <BaseButton
            type="submit"
            variant="primary"
            :disabled="isLoading"
            class="submit-button"
          >
            {{ isLoading ? $t('auth.login.loggingIn') : $t('common.login') }}
          </BaseButton>
        </form>
      </div>
    </div>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import BaseInput from '@/components/base/BaseInput/BaseInput.vue';
import BaseButton from '@/components/base/BaseButton/BaseButton.vue';
import ErrorBox from '@/components/common/ErrorBox/ErrorBox.vue';
import ThemeToggle from '@/components/common/ThemeToggle/ThemeToggle.vue';
import LocaleToggle from '@/components/common/LocaleToggle/LocaleToggle.vue';
import Footer from '@/components/common/Footer/Footer.vue';
import { useAdminLogin } from './AdminLoginView';

const {
  email,
  password,
  errorMessage,
  isLoading,
  handleSubmit,
} = useAdminLogin();
</script>

<style scoped src="./AdminLoginView.css"></style>
