<template>
  <div class="login-form-wrapper">
    <div class="login-form-content">
      <h2>{{ $t('auth.login.title') }} <br><span class="brand">{{ $t('common.brand') }}</span></h2>

      <ErrorBox :message="translatedErrorMessage" />

      <form @submit.prevent="handleLogin">
        <label>{{ $t('common.email') }}</label>
        <BaseInput
            v-model="state.email"
            :placeholder="$t('common.emailPlaceholder')"
            :maxlength="100"
            required
            :disabled="state.isLoading"
        />

        <label>{{ $t('common.password') }}</label>
        <BaseInput
            v-model="state.password"
            type="password"
            :placeholder="$t('common.passwordPlaceholder')"
            :maxlength="255"
            required
            :disabled="state.isLoading"
        />

        <div class="forgot">
          <a href="#" @click.prevent="router.replace('/reset-password')">{{ $t('auth.login.forgotPassword') }}</a>
        </div>

        <BaseButton type="submit" variant="primary" :disabled="state.isLoading">
          {{ state.isLoading ? $t('auth.login.loggingIn') : $t('auth.login.loginButton') }}
        </BaseButton>

        <BaseButton type="button" variant="secondary" @click="router.replace('/register')">
          {{ $t('common.register') }}
        </BaseButton>
      </form>

      <GoogleIcon @click="handleGoogleLogin" />
    </div>

    <Footer />
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
import Footer from '@/components/common/Footer/Footer.vue';
import {
  createInitialLoginState,
  getTranslatedErrorMessage,
  handleLoginLogic,
  handleGoogleLoginLogic
} from './LoginForm';
import './LoginForm.css';

const router = useRouter();
const { t } = useI18n();

const state = reactive(createInitialLoginState());

const translatedErrorMessage = computed(() =>
    getTranslatedErrorMessage(state.errorKey, t)
);

const handleLogin = async (): Promise<void> => {
  await handleLoginLogic(state, router);
};

const handleGoogleLogin = async (): Promise<void> => {
  await handleGoogleLoginLogic((key: string) => {
    state.errorKey = key;
  });
};
</script>

<style scoped src="./LoginForm.css"></style>