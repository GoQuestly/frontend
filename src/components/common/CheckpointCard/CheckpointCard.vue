<template>
  <div
      class="checkpoint-card"
      :class="{
        expanded: isExpanded,
        selected: isSelected,
        'view-mode': mode === 'view',
        'edit-mode': mode === 'edit',
        'accordion-mode': mode === 'accordion'
      }"
      @click="handleClick"
  >
    <div class="checkpoint-header">
      <div class="checkpoint-left">
        <div v-if="mode === 'edit'" class="drag-handle-column">
          <img src="@/assets/images/drag-handle.png" alt="Drag" class="drag-icon" />
        </div>

        <div class="checkpoint-info">
          <div class="checkpoint-title-row">
            <span class="checkpoint-number">{{ number }}.</span>

            <BaseInput
                v-if="mode === 'edit' && isExpanded"
                ref="nameInputRef"
                v-model="localCheckpoint.name"
                :placeholder="$t('quests.createQuest.step2.checkpointNamePlaceholder')"
                class="checkpoint-name-input"
                required
                :maxlength="300"
                @click.stop
            />

            <span v-else class="checkpoint-name">
              {{ localCheckpoint.name || $t('quests.createQuest.step2.checkpointNamePlaceholder') }}
            </span>

            <span v-if="mode === 'accordion' || mode === 'view'" class="checkpoint-coordinates">
              {{ localCheckpoint.latitude.toFixed(4) }}, {{ localCheckpoint.longitude.toFixed(4) }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="mode === 'edit'" class="checkpoint-actions">
        <DeleteButton @click="$emit('delete')" />
      </div>

      <div v-if="mode === 'accordion'" class="checkpoint-actions">
        <button class="toggle-icon" type="button">
          <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              :class="{ rotated: isExpanded }"
          >
            <path
                d="M5 7.5L10 12.5L15 7.5"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>

    <div
        v-if="isExpanded && mode === 'edit'"
        class="checkpoint-details"
    >
      <div class="coordinate-row">
        <div class="coordinate-item">
          <span class="coordinate-label">{{ $t('common.latitude') }}</span>
          <span class="coordinate-value">{{ localCheckpoint.latitude.toFixed(4) }}</span>
        </div>
        <div class="coordinate-item">
          <span class="coordinate-label">{{ $t('common.longitude') }}</span>
          <span class="coordinate-value">{{ localCheckpoint.longitude.toFixed(4) }}</span>
        </div>
      </div>

      <RoundCheckbox
          v-model="localCheckpoint.requiredForNext"
          :label="$t('quests.createQuest.step2.requiredForNext')"
      />

      <BaseButton
          variant="primary"
          class="save-btn"
          @click.stop="handleSaveClick"
      >
        {{ $t('common.save') }}
      </BaseButton>
    </div>

    <div v-if="isExpanded && mode === 'accordion'" class="checkpoint-content">
      <slot name="content"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import type { ComponentPublicInstance } from 'vue';
import BaseInput from '@/components/base/BaseInput/BaseInput.vue';
import BaseButton from '@/components/base/BaseButton/BaseButton.vue';
import RoundCheckbox from '@/components/common/RoundCheckbox/RoundCheckbox.vue';
import DeleteButton from '@/components/common/DeleteButton/DeleteButton.vue';
import { useCheckpointCard, type Checkpoint } from './CheckpointCard';

interface Props {
  checkpoint: Checkpoint;
  number: number;
  isSelected?: boolean;
  mode?: 'edit' | 'accordion' | 'view';
  expanded?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isSelected: false,
  mode: 'edit',
  expanded: false,
});

const emit = defineEmits<{
  (e: 'update', checkpoint: Checkpoint): void;
  (e: 'select'): void;
  (e: 'delete'): void;
  (e: 'save', checkpoint: Checkpoint): void;
  (e: 'toggle'): void;
}>();

const {
  localCheckpoint,
  isExpanded,
  handleClick,
  handleSave
} = useCheckpointCard(props, emit);

const nameInputRef = ref<ComponentPublicInstance<HTMLInputElement> | null>(null);

const handleSaveClick = (): void => {
  const inputEl = nameInputRef.value?.$el as HTMLInputElement | undefined;
  if (inputEl && !inputEl.checkValidity()) {
    inputEl.reportValidity();
    return;
  }
  handleSave();
};
</script>

<style scoped src="./CheckpointCard.css"></style>



