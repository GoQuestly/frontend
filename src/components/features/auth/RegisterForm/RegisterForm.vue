<template>
  <div class="register-form-wrapper">
    <div class="register-logo">
      <img :src="logo" alt="GoQuestly Logo" />
    </div>

    <h1 class="register-title">{{ $t('common.brand') }}</h1>
    <p class="register-subtitle">{{ $t('auth.register.subtitle') }}</p>

    <ErrorBox :message="translatedErrorMessage" />

    <form @submit.prevent="handleRegister">
      <BaseInput
          v-model="state.name"
          :placeholder="$t('common.name')"
          :maxlength="100"
          required
          :disabled="state.isLoading"
      />

      <BaseInput
          v-model="state.email"
          :placeholder="$t('common.email')"
          :maxlength="100"
          required
          :disabled="state.isLoading"
      />

      <BaseInput
          v-model="state.password"
          :placeholder="$t('common.password')"
          :maxlength="255"
          required
          :disabled="state.isLoading"
      />

      <BaseInput
          v-model="state.confirmPassword"
          :placeholder="$t('auth.register.confirmPasswordPlaceholder')"
          :maxlength="255"
          required
          :disabled="state.isLoading"
      />

      <BaseButton type="submit" variant="primary" :disabled="state.isLoading">
        {{ state.isLoading ? $t('auth.register.registering') : $t('common.register') }}
      </BaseButton>
    </form>

    <GoogleIcon @click="handleGoogleRegister" />

    <p class="login-link">
      {{ $t('auth.register.alreadyHaveAccount') }}
      <a href="#" @click.prevent="router.push('/login')" class="link">{{ $t('common.login') }}</a>
    </p>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import BaseInput from '@/components/base/BaseInput/BaseInput.vue';
import BaseButton from '@/components/base/BaseButton/BaseButton.vue';
import ErrorBox from '@/components/common/ErrorBox/ErrorBox.vue';
import GoogleIcon from '@/components/common/GoogleIcon/GoogleIcon.vue';
import {
  createInitialRegisterState,
  getTranslatedErrorMessage,
  handleRegisterLogic,
  handleGoogleRegisterLogic
} from './RegisterForm';
import { logo } from '@/assets/images';
import './RegisterForm.css';

const router = useRouter();
const { t } = useI18n();

const state = reactive(createInitialRegisterState());

const translatedErrorMessage = computed(() =>
    getTranslatedErrorMessage(state.errorKey, t)
);

const handleRegister = async (): Promise<void> => {
  await handleRegisterLogic(state, router);
};

const handleGoogleRegister = async (): Promise<void> => {
  await handleGoogleRegisterLogic((key: string) => {
    state.errorKey = key;
  });
};
</script>

<style scoped src="./RegisterForm.css"></style>