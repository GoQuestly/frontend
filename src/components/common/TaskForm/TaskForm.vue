<template>
  <form class="task-form" ref="formRef" @click.stop @submit.prevent="handleSubmit">
    <div class="task-details-header">
      <h3>{{ $t('quests.createQuest.step3.taskDetails') }}</h3>
      <DeleteButton
          v-if="!isTitleOnly"
          @click="$emit('remove-task')"
          :title="$t('quests.createQuest.step3.removeTask')"
      />
    </div>

    <ErrorBox :message="errorMessage" />
    <SuccessBox :message="successMessage" />

    <div class="form-row">
      <div class="form-field">
        <label class="field-label">
          {{ $t('quests.createQuest.step3.taskType') }}
          <span class="required-star">*</span>
        </label>
        <ErrorBox :message="errors.type" />
        <select
            v-model="localTask.type"
            class="base-select"
            @change="handleTypeChange"
            :disabled="!!localTask.questTaskId || isTitleOnly"
        >
          <option value="quiz">{{ $t('quests.createQuest.step3.quiz') }}</option>
          <option value="photo">{{ $t('quests.createQuest.step3.photo') }}</option>
          <option value="code_word">{{ $t('quests.createQuest.step3.codeWord') }}</option>
        </select>
        <span v-if="localTask.questTaskId" class="field-hint">
          {{ $t('quests.createQuest.step3.taskTypeLockedHint') }}
        </span>
      </div>

      <div class="form-field">
        <label class="field-label">
          {{ $t('quests.createQuest.step3.taskTitle') }}
          <span class="required-star">*</span>
        </label>
        <BaseInput
            v-model="localTask.title"
            :placeholder="$t('quests.createQuest.step3.taskTitlePlaceholder')"
            :maxlength="300"
            required
            :disabled="isTitleOnly"
            @update:model-value="emitUpdate"
        />
      </div>
    </div>

    <template v-if="localTask.type === 'photo' && !isTitleOnly">
      <div class="form-row">
        <div class="form-field">
          <label class="field-label">
            {{ $t('quests.createQuest.step3.points') }}
            <span class="required-star">*</span>
          </label>
          <ErrorBox :message="errors.maxPoints" />
          <BaseInput
              v-model="localTask.maxPoints"
              type="text"
              numbers-only
              :maxlength="9"
              inputmode="numeric"
              :min="0"
              :max="100"
              placeholder="100"
              required
              @update:model-value="emitUpdate"
          />
        </div>

        <div class="form-field">
          <label class="field-label">
            {{ $t('quests.createQuest.step3.taskDuration') }}
            <span class="required-star">*</span>
          </label>
          <ErrorBox :message="errors.duration" />
          <BaseInput
              v-model="localTask.duration"
              type="number"
              numbers-only
              :min="1"
              :max="1440"
              :placeholder="$t('quests.createQuest.step3.taskDurationPlaceholder')"
              required
              @update:model-value="emitUpdate"
          />
        </div>

      </div>

        <div class="form-row checkbox-row">
          <div class="form-field checkbox-field">
            <RoundCheckbox
                v-model="localTask.requiredToUnlock"
                :label="$t('quests.createQuest.step3.requiredToUnlock')"
                :disabled="isTitleOnly"
                @update:model-value="emitUpdate"
          />
        </div>
      </div>
    </template>

    <template v-else-if="localTask.type === 'code_word' && !isTitleOnly">
      <div class="form-row">
        <div class="form-field">
          <label class="field-label">
            {{ $t('quests.createQuest.step3.points') }}
            <span class="required-star">*</span>
          </label>
          <ErrorBox :message="errors.maxPoints" />
          <BaseInput
              v-model="localTask.maxPoints"
              type="text"
              numbers-only
              :maxlength="9"
              inputmode="numeric"
              :min="0"
              :max="100"
              placeholder="100"
              required
              @update:model-value="emitUpdate"
          />
        </div>

        <div class="form-field">
          <label class="field-label">
            {{ $t('quests.createQuest.step3.codeWordLabel') }}
            <span class="required-star">*</span>
          </label>
          <ErrorBox :message="errors.codeWord" />
          <BaseInput
              v-model="localTask.codeWord"
              :placeholder="$t('quests.createQuest.step3.codeWordPlaceholder')"
              :maxlength="200"
              required
              @update:model-value="emitUpdate"
          />
        </div>

        <div class="form-field">
          <label class="field-label">
            {{ $t('quests.createQuest.step3.taskDuration') }}
            <span class="required-star">*</span>
          </label>
          <ErrorBox :message="errors.duration" />
          <BaseInput
              v-model="localTask.duration"
              type="number"
              numbers-only
              :min="1"
              :max="1440"
              :placeholder="$t('quests.createQuest.step3.taskDurationPlaceholder')"
              required
              @update:model-value="emitUpdate"
          />
        </div>
      </div>

        <div class="form-row checkbox-row">
          <div class="form-field checkbox-field">
            <RoundCheckbox
                v-model="localTask.requiredToUnlock"
                :label="$t('quests.createQuest.step3.requiredToUnlock')"
                :disabled="isTitleOnly"
              @update:model-value="emitUpdate"
          />
        </div>
      </div>
    </template>

    <template v-else-if="localTask.type === 'quiz' && !isTitleOnly">
      <div class="form-field">
        <label class="field-label">
          {{ $t('quests.createQuest.step3.taskDuration') }}
          <span class="required-star">*</span>
        </label>
        <ErrorBox :message="errors.duration" />
        <BaseInput
            v-model="localTask.duration"
            type="number"
            numbers-only
            :min="1"
            :max="1440"
            :placeholder="$t('quests.createQuest.step3.taskDurationPlaceholder')"
            required
            @update:model-value="emitUpdate"
        />
      </div>

      <div class="form-field">
        <label class="field-label">
          {{ $t('quests.createQuest.step3.successThreshold') }}
          <span class="required-star">*</span>
        </label>
        <ErrorBox :message="errors.successThreshold" />
        <BaseInput
            v-model="localTask.successThreshold"
            type="number"
            numbers-only
            :min="0"
            :max="100"
            placeholder="80"
            required
            @update:model-value="emitUpdate"
        />
      </div>

      <div class="form-field checkbox-field checkbox-center">
        <RoundCheckbox
            v-model="localTask.requiredToUnlock"
            :label="$t('quests.createQuest.step3.requiredToUnlock')"
            :disabled="isTitleOnly"
            @update:model-value="emitUpdate"
        />
      </div>

      <QuizQuestions
          v-model="localTask.questions"
          :errors="errors.questions"
          :editable="true"
          @update:model-value="emitUpdate"
      />
    </template>

    <BaseButton
        variant="primary"
        type="submit"
        :disabled="isSaving"
        class="save-task-btn"
    >
      {{ isSaving ? $t('common.saving') : $t('common.save') }}
    </BaseButton>
  </form>
</template>

<script setup lang="ts">
import BaseInput from '@/components/base/BaseInput/BaseInput.vue';
import BaseButton from '@/components/base/BaseButton/BaseButton.vue';
import RoundCheckbox from '@/components/common/RoundCheckbox/RoundCheckbox.vue';
import DeleteButton from '@/components/common/DeleteButton/DeleteButton.vue';
import ErrorBox from '@/components/common/ErrorBox/ErrorBox.vue';
import SuccessBox from '@/components/common/SuccessBox/SuccessBox.vue';
import { ref, computed } from 'vue';
import QuizQuestions from './QuizQuestions/QuizQuestions.vue';
import { useTaskForm, type Props, type Emits } from './TaskForm';
import './TaskForm.css';

const props = withDefaults(defineProps<Props>(), {
  titleOnly: false,
});
const emit = defineEmits<Emits>();

const {
  localTask,
  isSaving,
  errorMessage,
  successMessage,
  errors,
  handleTypeChange,
  handleSave,
  emitUpdate,
} = useTaskForm(props, emit);

const formRef = ref<HTMLFormElement | null>(null);
const isTitleOnly = computed(() => props.titleOnly ?? false);

const handleSubmit = (): void => {
  if (formRef.value && !formRef.value.reportValidity()) {
    return;
  }
  handleSave();
};
</script>

<style scoped src="./TaskForm.css"></style>
