<template>
  <div class="change-password-wrapper">
    <div class="change-password-content">
      <h2>{{ $t('auth.changePassword.title') }}</h2>

      <ErrorBox :message="translatedErrorMessage" />
      <SuccessBox v-if="state.isSuccess" :message="$t('auth.changePassword.passwordChangedSuccess')" />

      <form @submit.prevent="handleChangePassword">
        <BaseInput
            v-model="state.password"
            type="password"
            :placeholder="$t('auth.changePassword.newPasswordPlaceholder')"
            :maxlength="100"
            required
            :disabled="state.isLoading"
        />

        <BaseInput
            v-model="state.confirmPassword"
            type="password"
            :placeholder="$t('auth.changePassword.confirmPasswordPlaceholder')"
            :maxlength="100"
            required
            :disabled="state.isLoading"
        />

        <BaseButton
            type="submit"
            variant="primary"
            :disabled="state.isLoading"
            class="send-button"
        >
          {{ state.isLoading
            ? $t('common.confirming')
            : $t('auth.changePassword.confirmButton')
          }}
        </BaseButton>

        <BaseButton
            type="button"
            variant="secondary"
            @click="router.replace('/login')"
            class="back-button"
        >
          {{ $t('common.backToLogin') }}
        </BaseButton>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import BaseInput from '@/components/base/BaseInput/BaseInput.vue';
import BaseButton from '@/components/base/BaseButton/BaseButton.vue';
import ErrorBox from '@/components/common/ErrorBox/ErrorBox.vue';
import SuccessBox from '@/components/common/SuccessBox/SuccessBox.vue';
import {
  createInitialChangePasswordState,
  getTranslatedErrorMessage,
  handleChangePasswordLogic,
  initializeToken,
} from './ChangePasswordForm';
import './ChangePasswordForm.css';

const router = useRouter();
const route = useRoute();
const { t } = useI18n();

const state = reactive(createInitialChangePasswordState());

const translatedErrorMessage = computed(() =>
    getTranslatedErrorMessage(state.errorKey, t)
);

onMounted(() => {
  const token = route.query.token as string;
  initializeToken(state, token, router);
});

const handleChangePassword = async (): Promise<void> => {
  await handleChangePasswordLogic(state, router);
};
</script>

<style src="./ChangePasswordForm.css" scoped />