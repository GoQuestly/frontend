<template>
  <div class="auth-error-container">
    <div class="controls">
      <LocaleToggle />
      <ThemeToggle />
    </div>

    <div class="content">
      <h1>{{ $t('auth.error.title') }}</h1>
      <p>{{ displayErrorMessage }}</p>

      <BaseButton @click="goToHome" variant="primary" style="margin-top: 20px;">
        {{ $t('auth.error.goToHome') }}
      </BaseButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import ThemeToggle from '@/components/common/ThemeToggle/ThemeToggle.vue';
import LocaleToggle from '@/components/common/LocaleToggle/LocaleToggle.vue';
import BaseButton from '@/components/base/BaseButton/BaseButton.vue';
import {
  getDisplayErrorMessage,
  extractErrorMessageFromRoute
} from './AuthErrorView';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const errorMessage = ref<string>('');

const displayErrorMessage = computed(() =>
    getDisplayErrorMessage(errorMessage.value, t)
);

const goToHome = (): void => {
  router.push('/');
};

onMounted(() => {
  errorMessage.value = extractErrorMessageFromRoute(route);
});

</script>

<style scoped src="./AuthErrorView.css"></style>