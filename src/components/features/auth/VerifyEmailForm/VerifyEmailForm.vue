<template>
  <div class="verify-email-form">
    <TimerBadge
        v-if="state.timerDuration > 0"
        ref="timerRef"
        :duration="state.timerDuration"
        @complete="onTimerComplete"
    />

    <h2 class="verify-title">{{ $t('auth.verifyEmail.title') }}</h2>

    <ErrorBox :message="translatedErrorMessage" />

    <form @submit.prevent="handleVerify">
      <BaseInput
          v-model="state.code"
          type="text"
          placeholder=""
          :maxlength="6"
          :numbers-only="true"
          required
          :disabled="state.isLoading"
      />

      <BaseButton
          type="button"
          variant="secondary"
          :disabled="!state.canResend || state.isResending"
          @click="handleResendCode"
      >
        {{ state.isResending ? $t('common.resending') : $t('auth.verifyEmail.resendButton') }}
      </BaseButton>

      <BaseButton type="submit" variant="primary" :disabled="state.isLoading">
        {{ state.isLoading ? $t('auth.verifyEmail.verifying') : $t('auth.verifyEmail.verifyButton') }}
      </BaseButton>
    </form>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import BaseInput from '@/components/base/BaseInput/BaseInput.vue';
import BaseButton from '@/components/base/BaseButton/BaseButton.vue';
import ErrorBox from '@/components/common/ErrorBox/ErrorBox.vue';
import TimerBadge from '@/components/common/TimerBadge/TimerBadge.vue';
import {
  createInitialVerifyState,
  getTranslatedErrorMessage,
  fetchVerificationStatusLogic,
  handleResendCodeLogic,
  handleVerifyLogic,
} from './VerifyEmailForm';
import './VerifyEmailForm.css';

const router = useRouter();
const { t } = useI18n();

const state = reactive(createInitialVerifyState());
const timerRef = ref<InstanceType<typeof TimerBadge> | null>(null);

const translatedErrorMessage = computed(() =>
    getTranslatedErrorMessage(state.errorKey, t)
);

const onTimerComplete = (): void => {
  state.canResend = true;
  state.timerDuration = 0;
};

const handleResendCode = async (): Promise<void> => {
  await handleResendCodeLogic(state, router, timerRef.value);
};

const handleVerify = async (): Promise<void> => {
  await handleVerifyLogic(state, router);
};

onMounted(() => {
  fetchVerificationStatusLogic(state, router, timerRef.value);
});
</script>

<style scoped src="./VerifyEmailForm.css"></style>