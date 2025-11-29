<template>
  <div v-if="visible" class="session-modal-backdrop">
    <div class="session-modal">
      <div class="session-modal__header">
        <h2 class="session-modal__title">
          {{ mode === 'edit'
            ? translateWithFallback('quests.sessions.editTitle', 'Edit Session Time')
            : translateWithFallback('quests.sessions.createTitle', 'Create New Session')
          }}
        </h2>
        <button type="button" class="session-modal__close" @click="$emit('close')" aria-label="Close">
          ×
        </button>
      </div>

      <form class="session-modal__body" @submit.prevent="$emit('submit')">
        <label class="session-modal__label">
          <span class="label-row">
            {{ translateWithFallback('quests.sessions.startDate', 'Start Date & Time') }}<span class="required-star">*</span>
          </span>
          <BaseInput
              :modelValue="startDate"
              @update:modelValue="$emit('update:startDate', $event)"
              type="datetime-local"
              :min="minStartDate"
              required
              class="session-modal__input"
          />
        </label>

        <ErrorBox v-if="error" :message="error" class="session-modal__error" />

        <div class="session-modal__actions">
          <BaseButton
              type="button"
              variant="secondary"
              class="modal-btn modal-btn--wide"
              :disabled="isSubmitting"
              @click="$emit('close')"
          >
            {{ translateWithFallback('common.cancel', 'Cancel') }}
          </BaseButton>
          <BaseButton
              type="submit"
              variant="primary"
              class="modal-btn modal-btn--wide"
              :disabled="isSubmitting"
          >
            {{ isSubmitting
              ? translateWithFallback('common.loading', 'Loading...')
              : mode === 'edit'
                ? translateWithFallback('common.save', 'Save')
                : translateWithFallback('quests.sessions.createCta', 'Create Session')
            }}
          </BaseButton>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import BaseButton from '@/components/base/BaseButton/BaseButton.vue';
import BaseInput from '@/components/base/BaseInput/BaseInput.vue';
import ErrorBox from '@/components/common/ErrorBox/ErrorBox.vue';

withDefaults(defineProps<{
  visible: boolean;
  startDate: string;
  error: string;
  isSubmitting: boolean;
  translateWithFallback: (key: string, fallback: string) => string;
  minStartDate: string;
  mode?: 'create' | 'edit';
}>(), {
  mode: 'create',
});

defineEmits(['update:startDate', 'close', 'submit']);
</script>

<style scoped>
.session-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 1000;
}

.session-modal {
  width: min(600px, 100%);
  background: var(--bg-form);
  border-radius: 18px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.15rem 1rem 1.25rem;
}

.session-modal__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 0.5rem;
}

.session-modal__title {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-primary);
}

.session-modal__close {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: var(--text-primary);
  padding: 0.1rem 0.45rem;
  line-height: 1;
}

.session-modal__body {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.session-modal__label {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.95rem;
  color: var(--text-secondary);
}

.session-modal__input {
  margin-bottom: 0;
}

.session-modal__error {
  color: var(--error-text);
  font-size: 0.92rem;
}

.session-modal__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
  margin-top: 0.35rem;
}

.required-star {
  color: var(--error-text);
  margin-left: 0.2rem;
}

.label-row {
  display: inline-flex;
  align-items: center;
  gap: 0.15rem;
  white-space: nowrap;
}

.modal-btn {
  min-width: 115px;
  padding: 0.6rem 1.25rem !important;
  border-radius: 14px !important;
}

.modal-btn--wide {
  min-width: 8rem;
}

@media (max-width: 640px) {
  .session-modal {
    padding: 1rem 0.85rem 1.1rem;
  }

  .session-modal__title {
    font-size: 1.2rem;
  }

  .session-modal__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .modal-btn {
    width: 100%;
  }
}
</style>
