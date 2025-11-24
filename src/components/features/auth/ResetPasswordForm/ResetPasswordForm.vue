<template>
  <div class="reset-form-wrapper">
    <div class="reset-form-content">
      <h2>{{ $t('auth.resetPassword.title') }}</h2>

      <ErrorBox :message="translatedErrorMessage" />
      <SuccessBox v-if="state.isSuccess" :message="$t('auth.resetPassword.successMessage')" />

      <form @submit.prevent="handleReset">
        <BaseInput
            v-model="state.email"
            :placeholder="$t('common.emailPlaceholder')"
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
            ? $t('common.sending')
            : $t('auth.resetPassword.sendButton')
          }}
        </BaseButton>

        <BaseButton
            type="button"
            variant="secondary"
            @click="router.replace('/login');"
            class="back-button"
        >
          {{ $t('common.backToLogin') }}
        </BaseButton>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import BaseInput from '@/components/base/BaseInput/BaseInput.vue';
import BaseButton from '@/components/base/BaseButton/BaseButton.vue';
import ErrorBox from '@/components/common/ErrorBox/ErrorBox.vue';
import SuccessBox from '@/components/common/SuccessBox/SuccessBox.vue';
import {
  createInitialResetPasswordState,
  getTranslatedErrorMessage,
  handleResetPasswordLogic,
} from './ResetPasswordForm.ts';
import './ResetPasswordForm.css';

const router = useRouter();
const { t } = useI18n();

const state = reactive(createInitialResetPasswordState());

const translatedErrorMessage = computed(() =>
    getTranslatedErrorMessage(state.errorKey, t)
);

const handleReset = async (): Promise<void> => {
  await handleResetPasswordLogic(state);
};

</script>

