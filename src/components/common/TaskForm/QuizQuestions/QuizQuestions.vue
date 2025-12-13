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
            v-if="props.editable && localQuestions.length > 1"
            class="delete-question-btn"
            type="button"
            :disabled="props.disabled"
            @click="deleteQuestion(question.id)"
        >
          <img :src="deleteIcon" alt="Delete" />
        </button>
      </div>

      <div class="form-field">
        <BaseInput
            v-model="question.text"
            :placeholder="$t('quests.createQuest.step3.questionPlaceholder')"
            :maxlength="300"
            required
            :disabled="props.disabled"
            @update:model-value="emitUpdate"
        />
      </div>

      <div class="multiple-correct-toggle">
        <label class="toggle-label">
          <RoundCheckbox
              :model-value="question.allowMultipleCorrect || false"
              :disabled="props.disabled"
              @update:model-value="(value) => toggleMultipleCorrect(question.id, value)"
          />
          <span>{{ $t('quests.createQuest.step3.allowMultipleCorrect') }}</span>
        </label>
        <span class="mode-hint">
          {{ question.allowMultipleCorrect
            ? $t('quests.createQuest.step3.multipleCorrectHint')
            : $t('quests.createQuest.step3.singleCorrectHint')
          }}
        </span>
      </div>

      <div class="answer-options">
        <div
            v-for="(option, oIndex) in question.options"
            :key="option.id"
            class="answer-option"
        >
          <RoundCheckbox
              :model-value="option.isCorrect"
              class="correct-answer-checkbox"
              :disabled="props.disabled"
              @update:model-value="(value) => toggleCorrectAnswer(question.id, option.id, value)"
          />
          <BaseInput
              v-model="option.text"
              :placeholder="`${$t('quests.createQuest.step3.answerOption')} ${oIndex + 1}`"
              :maxlength="200"
              required
              :disabled="props.disabled"
              @update:model-value="emitUpdate"
          />
          <button
              v-if="props.editable"
              class="delete-option-btn"
              type="button"
              :disabled="question.options.length <= MIN_OPTIONS || props.disabled"
              :title="$t('quests.createQuest.step3.removeAnswerOption')"
              @click="deleteOption(question.id, option.id)"
          >
            <img src="../../../../assets/images/delete-icon.png" alt="Delete option" />
          </button>
        </div>

        <button
            v-if="props.editable"
            class="add-option-btn"
            type="button"
            :disabled="question.options.length >= MAX_OPTIONS || props.disabled"
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
            :disabled="props.disabled"
            @update:model-value="emitUpdate"
        />
      </div>
    </div>

    <button
        v-if="props.editable"
        class="add-question-btn"
        type="button"
        :disabled="props.disabled"
        @click="addQuestion"
    >
      <span class="plus-icon">+</span>
      {{ $t('quests.createQuest.step3.addQuestion') }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { reactive, watch, withDefaults } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseInput from '@/components/base/BaseInput/BaseInput.vue';
import ErrorBox from '@/components/common/ErrorBox/ErrorBox.vue';
import RoundCheckbox from '@/components/common/RoundCheckbox/RoundCheckbox.vue';
import type { Question } from '@/types/task.ts';
import { useConfirmDialog } from '@/composables/useConfirmDialog';
import { deleteIcon } from '@/assets/images';

interface Props {
  modelValue: Question[];
  errors?: { [key: number]: { text: string; points: string; answers: string } };
  disabled?: boolean;
  editable?: boolean;
}

const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  editable: true,
});

const emit = defineEmits<{
  (e: 'update:modelValue', questions: Question[]): void;
}>();

const { t } = useI18n();
const confirmDialog = useConfirmDialog();

const localQuestions = reactive<Question[]>(props.modelValue.map(q => normalizeQuestion(q)));

function normalizeQuestion(question: Question): Question {
  const normalizedOptions = question.options && question.options.length > 0 ? [...question.options] : [
    { id: '1', text: '', isCorrect: true },
    { id: '2', text: '', isCorrect: false },
  ];

  if (!normalizedOptions.some(o => o.isCorrect)) {
    normalizedOptions[0].isCorrect = true;
  }

  // Auto-detect if question has multiple correct answers
  const correctCount = normalizedOptions.filter(o => o.isCorrect).length;
  const hasMultipleCorrect = correctCount > 1;

  return {
    ...question,
    options: normalizedOptions,
    allowMultipleCorrect: question.allowMultipleCorrect ?? hasMultipleCorrect,
  };
}

watch(() => props.modelValue, (newQuestions) => {
  const normalized = newQuestions.map(q => normalizeQuestion(q));
  localQuestions.splice(0, localQuestions.length, ...normalized);
}, { deep: true });

const addQuestion = (): void => {
  const newQuestion: Question = {
    id: Date.now().toString(),
    text: '',
    points: '50',
    allowMultipleCorrect: false,
    options: [
      { id: '1', text: '', isCorrect: true },
      { id: '2', text: '', isCorrect: false },
    ],
  };

  localQuestions.push(newQuestion);
  emitUpdate();
};

const deleteQuestion = async (questionId: string): Promise<void> => {
  const confirmed = await confirmDialog({
    title: t('common.delete'),
    message: t('quests.createQuest.confirmations.deleteQuestion'),
    confirmText: t('common.delete'),
    cancelText: t('common.cancel'),
    tone: 'danger',
  });
  if (!confirmed) {
    return;
  }
  const index = localQuestions.findIndex(q => q.id === questionId);
  if (index !== -1) {
    localQuestions.splice(index, 1);
    emitUpdate();
  }
};

const toggleMultipleCorrect = (questionId: string, value: boolean): void => {
  const question = localQuestions.find(q => q.id === questionId);
  if (!question) return;

  question.allowMultipleCorrect = value;

  // If switching to single-choice mode and multiple answers are selected,
  // keep only the first correct answer
  if (!value) {
    const correctOptions = question.options.filter(opt => opt.isCorrect);
    if (correctOptions.length > 1) {
      question.options.forEach(opt => {
        opt.isCorrect = opt.id === correctOptions[0].id;
      });
    }
  }

  emitUpdate();
};

const toggleCorrectAnswer = (questionId: string, optionId: string, value: boolean): void => {
  const question = localQuestions.find(q => q.id === questionId);
  if (!question) return;

  const option = question.options.find(opt => opt.id === optionId);
  if (!option) return;

  if (question.allowMultipleCorrect) {
    // Multiple correct answers mode
    if (value) {
      option.isCorrect = true;
    } else {
      // Don't allow unchecking if it's the last correct answer
      const correctCount = question.options.filter(opt => opt.isCorrect).length;
      if (correctCount > 1) {
        option.isCorrect = false;
      } else {
        // Keep at least one correct answer
        return;
      }
    }
  } else {
    // Single correct answer mode
    if (value) {
      question.options.forEach(opt => {
        opt.isCorrect = opt.id === optionId;
      });
    } else {
      // Don't allow unchecking in single-choice mode
      return;
    }
  }

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

const deleteOption = async (questionId: string, optionId: string): Promise<void> => {
  const question = localQuestions.find(q => q.id === questionId);
  if (!question || question.options.length <= MIN_OPTIONS) {
    return;
  }

  const confirmed = await confirmDialog({
    title: t('common.delete'),
    message: t('quests.createQuest.confirmations.deleteAnswerOption'),
    confirmText: t('common.delete'),
    cancelText: t('common.cancel'),
    tone: 'danger',
  });

  if (!confirmed) {
    return;
  }

  const optionIndex = question.options.findIndex(option => option.id === optionId);
  if (optionIndex === -1) {
    return;
  }

  question.options.splice(optionIndex, 1);

  if (!question.options.some(opt => opt.isCorrect) && question.options.length > 0) {
    question.options[0].isCorrect = true;
  }

  emitUpdate();
};
</script>

<style scoped src="@/components/common/TaskForm/QuizQuestions/QuizQuestions.css"></style>
