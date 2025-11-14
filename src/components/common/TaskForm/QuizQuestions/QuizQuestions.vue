<template>
  <div class="quiz-section">
    <h3 class="section-title">{{ $t('quests.createQuest.step3.quizQuestions') }}</h3>

    <div
        v-for="(question, qIndex) in localQuestions"
        :key="question.id"
        class="question-block"
    >
      <div class="question-header">
        <span class="question-label">{{ $t('quests.createQuest.step3.question') }} {{ qIndex + 1 }}</span>
        <button
            v-if="localQuestions.length > 1"
            class="delete-question-btn"
            type="button"
            @click="deleteQuestion(question.id)"
        >
          <img src="../../../../assets/images/delete-icon.png" alt="Delete" />
        </button>
      </div>

      <div class="form-field">
        <ErrorBox :message="errors?.[qIndex]?.text || ''" />
        <BaseInput
            v-model="question.text"
            :placeholder="$t('quests.createQuest.step3.questionPlaceholder')"
            :maxlength="300"
            required
            @update:model-value="emitUpdate"
        />
      </div>

      <div class="answer-options">
        <ErrorBox :message="errors?.[qIndex]?.answers || ''" />
        <div
            v-for="(option, oIndex) in question.options"
            :key="option.id"
            class="answer-option"
        >
          <input
              type="radio"
              :name="`question-${question.id}`"
              :checked="option.isCorrect"
              @change="selectCorrectAnswer(question.id, option.id)"
              class="radio-input"
          />
          <BaseInput
              v-model="option.text"
              :placeholder="`${$t('quests.createQuest.step3.answerOption')} ${oIndex + 1}`"
              :maxlength="200"
              @update:model-value="emitUpdate"
          />
          <button
              class="delete-option-btn"
              type="button"
              :disabled="question.options.length <= MIN_OPTIONS || option.isCorrect"
              :title="option.isCorrect ? $t('quests.createQuest.step3.cannotDeleteCorrectAnswer') : $t('quests.createQuest.step3.removeAnswerOption')"
              @click="deleteOption(question.id, option.id)"
          >
            <img src="../../../../assets/images/delete-icon.png" alt="Delete option" />
          </button>
        </div>

        <button
            class="add-option-btn"
            type="button"
            :disabled="question.options.length >= MAX_OPTIONS"
            @click="addOption(question.id)"
        >
          <span class="plus-icon">+</span>
          {{ $t('quests.createQuest.step3.addAnswerOption') }}
        </button>
      </div>

      <div class="question-points">
        <label class="field-label">{{ $t('quests.createQuest.step3.pointsForQuestion') }}</label>
        <ErrorBox :message="errors?.[qIndex]?.points || ''" />
        <BaseInput
            v-model="question.points"
            type="number"
            numbers-only
            placeholder="50"
            style="max-width: 200px;"
            @update:model-value="emitUpdate"
        />
      </div>
    </div>

    <button class="add-question-btn" type="button" @click="addQuestion">
      <span class="plus-icon">+</span>
      {{ $t('quests.createQuest.step3.addQuestion') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseInput from '@/components/base/BaseInput/BaseInput.vue';
import ErrorBox from '@/components/common/ErrorBox/ErrorBox.vue';
import type { Question } from '@/types/task.ts';
import { confirmWithTranslation } from '@/utils/dialogs';

interface Props {
  modelValue: Question[];
  errors?: { [key: number]: { text: string; points: string; answers: string } };
}

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'update:modelValue', questions: Question[]): void;
}>();

const { t } = useI18n();

const localQuestions = reactive<Question[]>([...props.modelValue]);

watch(() => props.modelValue, (newQuestions) => {
  localQuestions.splice(0, localQuestions.length, ...newQuestions);
}, { deep: true });

const confirmAction = (key: string): boolean => confirmWithTranslation(t, key);

const addQuestion = (): void => {
  const newQuestion: Question = {
    id: Date.now().toString(),
    text: '',
    points: '50',
    options: [
      { id: '1', text: '', isCorrect: false },
      { id: '2', text: '', isCorrect: false },
    ],
  };

  localQuestions.push(newQuestion);
  emitUpdate();
};

const deleteQuestion = (questionId: string): void => {
  if (!confirmAction('quests.createQuest.confirmations.deleteQuestion')) {
    return;
  }
  const index = localQuestions.findIndex(q => q.id === questionId);
  if (index !== -1) {
    localQuestions.splice(index, 1);
    emitUpdate();
  }
};

const selectCorrectAnswer = (questionId: string, optionId: string): void => {
  const question = localQuestions.find(q => q.id === questionId);
  if (!question) return;

  question.options.forEach(option => {
    option.isCorrect = option.id === optionId;
  });

  emitUpdate();
};

const emitUpdate = (): void => {
  emit('update:modelValue', [...localQuestions]);
};

const addOption = (questionId: string): void => {
  const question = localQuestions.find(q => q.id === questionId);
  if (!question || question.options.length >= MAX_OPTIONS) {
    return;
  }

  const newOptionId = `${Date.now()}-${question.options.length + 1}`;
  question.options.push({
    id: newOptionId,
    text: '',
    isCorrect: false,
  });

  emitUpdate();
};

const deleteOption = (questionId: string, optionId: string): void => {
  const question = localQuestions.find(q => q.id === questionId);
  if (!question || question.options.length <= MIN_OPTIONS) {
    return;
  }

  const option = question.options.find(opt => opt.id === optionId);
  if (!option || option.isCorrect) {
    return;
  }

  if (!confirmAction('quests.createQuest.confirmations.deleteAnswerOption')) {
    return;
  }

  const optionIndex = question.options.findIndex(option => option.id === optionId);
  if (optionIndex === -1) {
    return;
  }

  const [removedOption] = question.options.splice(optionIndex, 1);

  if (removedOption?.isCorrect) {
    question.options.forEach(option => {
      option.isCorrect = false;
    });
  }

  emitUpdate();
};
</script>

<style scoped src="@/components/common/TaskForm/QuizQuestions/QuizQuestions.css"></style>
