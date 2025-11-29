<template>
  <div v-if="visible" class="confirm-dialog-backdrop">
    <div class="confirm-dialog">
      <div class="confirm-dialog__header">
        <h3 class="confirm-dialog__title">{{ title }}</h3>
        <button type="button" class="confirm-dialog__close" @click="$emit('cancel')" aria-label="Close">
          &times;
        </button>
      </div>
      <p class="confirm-dialog__message">{{ message }}</p>
      <div class="confirm-dialog__actions">
        <BaseButton
            type="button"
            variant="secondary"
            class="confirm-dialog__btn"
            :disabled="submitting"
            @click="$emit('cancel')"
        >
          {{ cancelText }}
        </BaseButton>
        <BaseButton
            type="button"
            variant="primary"
            class="confirm-dialog__btn"
            :class="{ 'confirm-dialog__btn--danger': tone === 'danger' }"
            :disabled="submitting"
            @click="$emit('confirm')"
        >
          {{ submitting ? workingText : confirmText }}
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton/BaseButton.vue';

withDefaults(defineProps<{
  visible: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  workingText?: string;
  submitting?: boolean;
  tone?: 'default' | 'danger';
}>(), {
  workingText: '...',
  submitting: false,
  tone: 'default',
});

defineEmits<{
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}>();
</script>

<style scoped>
.confirm-dialog-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    z-index: 1200;
}

.confirm-dialog {
    width: min(420px, 100%);
    background: var(--bg-form);
    border-radius: 16px;
    box-shadow: 0 18px 50px rgba(0, 0, 0, 0.22);
    padding: 1.2rem 1.25rem 1.35rem;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
}

.confirm-dialog__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
}

.confirm-dialog__title {
    margin: 0;
    font-size: 1.2rem;
    color: var(--text-primary);
}

.confirm-dialog__close {
    background: transparent;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: var(--text-primary);
    line-height: 1;
    padding: 0.15rem 0.35rem;
}

.confirm-dialog__message {
    margin: 0;
    color: var(--text-secondary);
    line-height: 1.45;
}

.confirm-dialog__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.65rem;
    margin-top: 0.25rem;
}

.confirm-dialog__btn {
    min-width: 115px;
    padding: 0.9rem 1.15rem;
    border-radius: 10px !important;
    font-weight: 700;
}

.confirm-dialog__btn--danger {
    background: var(--error-bg) !important;
    color: var(--error-text) !important;
    border: 1px solid var(--error-border) !important;
}

.confirm-dialog__btn--danger:hover:not(:disabled) {
    background: var(--error-hover-bg) !important;
    border-color: var(--error-hover-border) !important;
}

@media (max-width: 520px) {
    .confirm-dialog {
        padding: 1rem 1rem 1.1rem;
    }

    .confirm-dialog__actions {
        flex-direction: column;
    }

    .confirm-dialog__btn {
        width: 100%;
    }
}
</style>
