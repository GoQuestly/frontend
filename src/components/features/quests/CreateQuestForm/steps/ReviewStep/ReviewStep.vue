<template>
  <div class="review-step">
    <h2 class="step-title">{{ $t('quests.createQuest.step4.title') }}</h2>
    <p class="step-description">{{ $t('quests.createQuest.step4.description') }}</p>

    <section class="quest-overview">
      <h3 class="section-title">{{ $t('quests.createQuest.step4.questOverview') }}</h3>

      <div
          class="overview-layout"
          :class="{ 'overview-layout--no-description': !hasDescription }"
      >
        <div class="quest-cover">
          <div class="cover-image-container">
            <img
                v-if="coverImagePreview"
                :src="coverImagePreview"
                :alt="formData.title"
                class="cover-image"
            />
            <div v-else class="cover-placeholder">
              <img src="@/assets/images/camera-icon.png" alt="No image" class="camera-icon" />
            </div>

            <div class="cover-title">
              {{ formData.title || $t('quests.createQuest.step4.untitled') }}
            </div>
          </div>
        </div>

        <div v-if="hasDescription" class="middle-column">
          <div class="meta-card description-card">
            <span class="meta-label">{{ $t('quests.createQuest.step4.descriptionLabel') }}</span>
            <p class="description-text">{{ descriptionText }}</p>
          </div>
        </div>

        <div class="right-column">
          <div class="meta-row">
            <div class="meta-card">
              <span class="meta-label">{{ $t('quests.createQuest.step4.participants') }}</span>
              <span class="meta-value">{{ formData.minParticipants }}–{{ formData.maxParticipants }}</span>
            </div>

            <div class="meta-card">
              <span class="meta-label">{{ $t('quests.createQuest.step4.maxDuration') }}</span>
              <span class="meta-value">{{ formatDuration(formData.maxDuration) }}</span>
            </div>
          </div>

          <div class="meta-card">
            <div class="toggle-row">
              <span class="meta-label">{{ $t('quests.createQuest.step4.publicProgress') }}</span>
              <div class="toggle-display">
                <span class="toggle-text">{{ formData.publicProgressVisibility ? $t('common.on') : $t('common.off') }}</span>
                <div class="toggle-indicator" :class="{ active: formData.publicProgressVisibility }"></div>
              </div>
            </div>
          </div>

          <div class="starting-location">
            <h4>{{ $t('quests.createQuest.step4.startingLocation') }}</h4>
            <div class="location-map">
              <LeafletMapView
                  :checkpoints="[startingPointCheckpoint]"
                  :selected-checkpoint-id="startingPointCheckpoint.id"
                  :interactive="true"
                  :editable="false"
                  :show-instructions="false"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="checkpoints-summary">
      <h3 class="section-title">{{ $t('quests.createQuest.step4.checkpointsSummary') }}</h3>

      <div v-if="formData.checkpoints.length === 0" class="no-checkpoints">
        <p>{{ $t('quests.createQuest.step4.noCheckpointsMessage') }}</p>
      </div>

      <div v-else class="checkpoint-list">
        <div
            v-for="(checkpoint, index) in formData.checkpoints"
            :key="checkpoint.id"
            class="checkpoint-item"
            :class="{ required: checkpoint.requiredForNext }"
        >
          <div class="checkpoint-number">{{ index + 1 }}</div>
          <div class="checkpoint-info">
            <div class="checkpoint-name-row">
              <span class="checkpoint-name">{{ checkpoint.name }}</span>
              <span class="checkpoint-coords">({{ checkpoint.latitude.toFixed(4) }}° N, {{ checkpoint.longitude.toFixed(4) }}° E)</span>
              <span v-if="checkpoint.requiredForNext" class="checkpoint-status required">
                {{ $t('quests.createQuest.step4.requiredForNext') }}
              </span>
              <span v-else class="checkpoint-status optional">
                {{ $t('quests.createQuest.step4.optional') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="tasks-summary">
      <h3 class="section-title">{{ $t('quests.createQuest.step4.tasksSummary') }}</h3>

      <div v-if="isLoadingTasks" class="loading-message">
        <p>{{ $t('common.loading') }}...</p>
      </div>

      <div v-else-if="checkpointsWithTasks.length === 0" class="no-tasks">
        <p>{{ $t('quests.createQuest.step4.noTasksMessage') }}</p>
      </div>

      <div v-else class="tasks-list">
        <div
            v-for="({ checkpoint, task }, index) in checkpointsWithTasks"
            :key="`task-${checkpoint.id}`"
            class="task-section"
        >
          <h4 class="task-section-title">
            {{ $t('quests.createQuest.step4.checkpoint') }} {{ index + 1 }}: {{ checkpoint.name }}
          </h4>

          <div v-if="task" class="task-item">
            <div class="task-type-column">
              <span v-if="task.type === 'code_word'" class="task-type-text">
                code<br/>word
              </span>
              <span v-else class="task-type-text">{{ task.type }}</span>
            </div>
            <div class="task-content">
              <div class="task-item-title">{{ getTaskTypeLabel(task.type) }}: {{ task.title || $t('quests.createQuest.step4.untitledTask') }}</div>
              <div class="task-item-details">
                {{ $t('quests.createQuest.step4.maxPoints') }}: {{ task.maxPoints }}<template v-if="task.duration">, {{ $t('common.duration') }}: {{ task.duration }} {{ $t('common.min') }}</template><template v-if="task.successThreshold">, {{ $t('quests.createQuest.step4.success') }}: {{ task.successThreshold }}%</template>
              </div>
            </div>
          </div>

          <div v-else class="no-task">
            {{ $t('quests.createQuest.step4.noTaskAssigned') }}
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LeafletMapView from '@/components/common/LeafletMapView/LeafletMapView.vue';
import { useReviewStep } from './ReviewStep';
import type { QuestFormData } from '@/types/form';
import './ReviewStep.css';

interface Props {
  modelValue: QuestFormData;
  questId: number | null;
  coverImagePreview?: string;
}

const props = defineProps<Props>();

const {
  formData,
  isLoadingTasks,
  startingPointCheckpoint,
  getTaskForCheckpoint,
  formatDuration,
  getTaskTypeLabel,
} = useReviewStep(props);

const hasDescription = computed(() => Boolean(formData.value.description?.trim().length));
const descriptionText = computed(() => formData.value.description?.trim() ?? '');

const checkpointsWithTasks = computed(() => {
  return formData.value.checkpoints.map(checkpoint => ({
    checkpoint,
    task: getTaskForCheckpoint(checkpoint.id),
  }));
});
</script>

<style src="./ReviewStep.css"></style>
