<template>
  <div class="task-assignment-step">
    <h2 class="step-title">{{ $t('quests.createQuest.step3.title') }}</h2>

    <ErrorBox :message="errorMessage" />
    <SuccessBox :message="successMessage" />

    <div v-if="isLoading" class="loading-message">
      <p>{{ $t('common.loading') }}...</p>
    </div>

    <div v-else class="checkpoints-list">
      <CheckpointCard
          v-for="(checkpoint, index) in getCheckpoints()"
          :key="checkpoint.id"
          :checkpoint="checkpoint"
          :number="index + 1"
          mode="accordion"
          :expanded="expandedCheckpointId === checkpoint.id"
          @toggle="toggleCheckpoint(checkpoint.id)"
      >
        <template #content>
          <div v-if="!checkpoint.task" class="no-task-message">
            <p>{{ $t('quests.createQuest.step3.noTasksAssigned') }}</p>
            <button
                class="add-task-btn"
                type="button"
                @click.stop="addTask(checkpoint.id)"
            >
              <span class="plus-icon">+</span>
              {{ $t('quests.createQuest.step3.addTask') }}
            </button>
          </div>

          <TaskForm
              v-else
              :key="`task-${checkpoint.id}`"
              :checkpoint="checkpoint"
              @update-task="updateTask(checkpoint.id, $event)"
              @remove-task="removeTask(checkpoint.id)"
          />
        </template>
      </CheckpointCard>
    </div>

    <div v-if="modelValue.checkpoints.length === 0" class="no-checkpoints">
      <p>{{ $t('quests.createQuest.step3.noCheckpoints') }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import CheckpointCard from '@/components/common/CheckpointCard/CheckpointCard.vue';
import TaskForm from '@/components/common/TaskForm/TaskForm.vue';
import ErrorBox from '@/components/common/ErrorBox/ErrorBox.vue';
import SuccessBox from '@/components/common/SuccessBox/SuccessBox.vue';
import { useTaskAssignment } from './TaskAssignmentStep';
import type { QuestFormData } from '@/types/form';
import './TaskAssignmentStep.css';

interface Props {
  modelValue: QuestFormData;
  questId: number | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update:modelValue', value: QuestFormData): void;
}>();

const {
  expandedCheckpointId,
  isLoading,
  errorMessage,
  successMessage,
  getCheckpoints,
  toggleCheckpoint,
  addTask,
  removeTask,
  updateTask,
  saveAllTasks,
} = useTaskAssignment(props, emit);

defineExpose({
  saveAllTasks,
});
</script>

<style scoped src="./TaskAssignmentStep.css"></style>
