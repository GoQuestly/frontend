<template>
  <div class="checkpoints-setup-step">
    <h2 class="step-title">{{ stepTitle }}</h2>
    <div class="step-feedback">
      <ErrorBox v-if="error" :message="error" class="step-error" />
    </div>

    <div class="checkpoints-container">
      <div class="checkpoints-list">
        <div ref="checkpointsListRef" class="draggable-container">
          <CheckpointCard
              v-for="(checkpoint, index) in localData.checkpoints"
              :key="`${checkpoint.id}-${index}`"
              :checkpoint="checkpoint"
              :number="index + 1"
              :is-selected="selectedCheckpointId === checkpoint.id"
              class="checkpoint-item"
              :data-id="checkpoint.id"
              :can-delete="true"
              :can-reorder="true"
              :allow-name-edit="true"
              :success-message="lastSavedCheckpointId === checkpoint.id ? successMessage : ''"
              @select="selectCheckpoint(checkpoint.id)"
              @delete="deleteCheckpoint(checkpoint.id)"
              @save="updateCheckpoint"
          />
        </div>

        <button
            class="add-checkpoint-btn"
            @click="addNewCheckpoint"
            :disabled="isCreating"
        >
          <img :src="addCheckpointIcon" alt="Add" class="add-icon" />
          {{ isCreating ? $t('common.creating') : $t('quests.createQuest.step2.addNewCheckpoint') }}
        </button>

        <p class="helper-text">{{ $t('quests.createQuest.step2.helperText') }}</p>
      </div>

      <div class="map-container">
        <LeafletMapView
            :checkpoints="localData.checkpoints"
            :selected-checkpoint-id="selectedCheckpointId"
            :starting-lat="props.modelValue.startingLat"
            :starting-lng="props.modelValue.startingLng"
            :interactive="true"
            :editable="true"
            @update-coordinates="updateCheckpointCoordinates"
            @marker-click="selectCheckpoint"
        />
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import CheckpointCard from '@/components/common/CheckpointCard/CheckpointCard.vue';
import LeafletMapView from '@/components/common/LeafletMapView/LeafletMapView.vue';
import ErrorBox from '@/components/common/ErrorBox/ErrorBox.vue';
import { computed } from 'vue';
import { useCheckpointsSetup } from './CheckpointsSetupStep';
import type { QuestFormData } from '@/types/form';
import { addCheckpointIcon } from '@/assets/images'
import { useI18n } from 'vue-i18n';
import './CheckpointsSetupStep.css';

interface Props {
  modelValue: QuestFormData;
  questId: number | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: QuestFormData): void;
}>();

const {
  localData,
  selectedCheckpointId,
  checkpointsListRef,
  isCreating,
  error,
  successMessage,
  lastSavedCheckpointId,
  selectCheckpoint,
  updateCheckpoint,
  updateCheckpointCoordinates,
  deleteCheckpoint,
  addNewCheckpoint,
  getCheckpoints,
} = useCheckpointsSetup(props, emit);

const { t: $t } = useI18n();
const stepTitle = computed(() => $t('quests.createQuest.step2.title'));

defineExpose({
  getCheckpoints,
});
</script>
