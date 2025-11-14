<template>
  <div class="create-quest-form">
    <div class="form-header">
      <h1>{{ $t('quests.createQuest.title') }}</h1>
      <p class="form-subtitle">{{ $t('quests.createQuest.subtitle') }}</p>
    </div>

    <StepIndicator
        :current-step="state.currentStep"
        :steps="steps"
        :quest-id="state.questId"
        @step-click="handleStepClick"
    />

    <div class="form-content-wrapper">
      <div class="form-content">
        <QuestInformationStep
            v-if="state.currentStep === 1"
            ref="questInformationStepRef"
            v-model="state.formData"
            :quest-id="state.questId"
            :existing-photo-url="state.photoUrl"
            :is-saving="state.isSubmitting"
            :success-message="successMessage"
            @cover-image-change="handleCoverImageChange"
            @save="handleSaveQuestInformation"
        />

        <CheckpointsSetupStep
            v-if="state.currentStep === 2 && state.questId !== null"
            :key="`checkpoints-${state.questId}`"
            ref="checkpointsSetupStepRef"
            v-model="state.formData"
            :quest-id="state.questId"
        />

        <TaskAssignmentStep
            v-if="state.currentStep === 3 && state.questId !== null"
            :key="`tasks-${state.questId}`"
            v-model="state.formData"
            :quest-id="state.questId"
        />

        <ReviewStep
            v-if="state.currentStep === 4 && state.questId !== null"
            :key="`review-${state.questId}`"
            :model-value="state.formData"
            :quest-id="state.questId"
            :cover-image-preview="coverImagePreview"
        />

        <div v-if="(state.currentStep === 2 || state.currentStep === 3 || state.currentStep === 4) && state.questId === null" class="no-quest-message">
          <p>{{ $t('quests.createQuest.errors.questNotCreated') }}</p>
          <BaseButton variant="primary" @click="state.currentStep = 1">
            {{ $t('quests.createQuest.goToStep1') }}
          </BaseButton>
        </div>
      </div>
    </div>

    <ErrorBox :message="state.uploadError" />

    <div class="form-actions">
      <BaseButton
          v-if="state.currentStep === 1"
          variant="secondary"
          @click="handleCancel"
          class="action-button action-button--secondary"
      >
        {{ $t('common.cancel') }}
      </BaseButton>

      <BaseButton
          v-else
          variant="secondary"
          @click="handleBack"
          class="action-button action-button--secondary"
      >
        {{ $t('common.back') }}
      </BaseButton>

      <BaseButton
          variant="primary"
          @click="handleNext"
          :disabled="state.isSubmitting"
          class="action-button action-button--primary"
      >
        {{ getNextButtonText() }}
      </BaseButton>
    </div>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import BaseButton from '@/components/base/BaseButton/BaseButton.vue';
import ErrorBox from '@/components/common/ErrorBox/ErrorBox.vue';
import Footer from '@/components/common/Footer/Footer.vue';
import StepIndicator from '@/components/common/StepIndicator/StepIndicator.vue';
import QuestInformationStep from './steps/QuestInformationStep/QuestInformationStep.vue';
import CheckpointsSetupStep from './steps/CheckpointsSetupStep/CheckpointsSetupStep.vue';
import TaskAssignmentStep from './steps/TaskAssignmentStep/TaskAssignmentStep.vue';
import ReviewStep from './steps/ReviewStep/ReviewStep.vue';
import { questsApi } from '@/api/questsApi';
import { showTemporaryMessage } from '@/utils/messages';
import {
  createInitialState,
  goToNextStep,
  goToPreviousStep,
  goToStep,
} from './CreateQuestForm';
import './CreateQuestForm.css';

const QUEST_DRAFT_STORAGE_KEY = 'createQuestDraft';
type QuestFormState = ReturnType<typeof createInitialState>;
type PersistedFormData = Omit<QuestFormState['formData'], 'coverImage'>;
type QuestDraftSnapshot = {
  currentStep: number;
  questId: number | null;
  photoUrl: string;
  formData: PersistedFormData;
};

const router = useRouter();
const route = useRoute();
const { t: $t } = useI18n();

const state = reactive({
  ...createInitialState(),
  uploadError: '',
  coverImageFile: null as File | null,
  questId: null as number | null,
  photoUrl: '' as string,
});

const successMessage = ref('');

const getPersistableFormData = (): PersistedFormData => {
  const { coverImage, ...persistableFormData } = state.formData;
  return { ...persistableFormData };
};

const persistQuestDraft = (): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const draft: QuestDraftSnapshot = {
      currentStep: state.currentStep,
      questId: state.questId,
      photoUrl: state.photoUrl,
      formData: getPersistableFormData(),
    };
    window.localStorage.setItem(QUEST_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch {}
};

const readQuestDraft = (): QuestDraftSnapshot | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  const storedDraft = window.localStorage.getItem(QUEST_DRAFT_STORAGE_KEY);
  if (!storedDraft) {
    return null;
  }

  try {
    return JSON.parse(storedDraft) as QuestDraftSnapshot;
  } catch {
    window.localStorage.removeItem(QUEST_DRAFT_STORAGE_KEY);
    return null;
  }
};

const applyDraftToState = (draft: QuestDraftSnapshot): void => {
  state.currentStep = draft.currentStep ?? 1;
  state.questId = draft.questId ?? null;
  state.photoUrl = draft.photoUrl ?? '';
  state.formData = {
    ...state.formData,
    ...(draft.formData || {}),
    coverImage: null,
  };
};

const clearQuestDraft = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  window.localStorage.removeItem(QUEST_DRAFT_STORAGE_KEY);
};

watch(
    () => ({
      currentStep: state.currentStep,
      questId: state.questId,
      photoUrl: state.photoUrl,
      formData: state.formData,
    }),
    persistQuestDraft,
    { deep: true },
);

const questInformationStepRef = ref<any>(null);
const checkpointsSetupStepRef = ref<any>(null);

const steps = computed(() => [
  { number: 1, label: $t('quests.createQuest.steps.information') },
  { number: 2, label: $t('quests.createQuest.steps.checkpoints') },
  { number: 3, label: $t('quests.createQuest.steps.tasks') },
  { number: 4, label: $t('quests.createQuest.steps.review') },
]);

const coverImagePreview = computed(() => {
  if (state.coverImageFile) {
    return URL.createObjectURL(state.coverImageFile);
  }
  return state.photoUrl || '';
});

onMounted(async () => {
  const restoredDraft = readQuestDraft();
  if (restoredDraft) {
    applyDraftToState(restoredDraft);
  }

  const questIdParam = route.query.questId as string | undefined;
  const questId = questIdParam ? parseInt(questIdParam, 10) : null;

  if (questId !== null && !Number.isNaN(questId) && (!restoredDraft || restoredDraft.questId !== questId)) {
    await loadExistingQuest(questId);
  }
});

const loadExistingQuest = async (questId: number): Promise<void> => {
  try {
    const quest = await questsApi.getQuestById(questId);

    state.questId = quest.questId;
    state.photoUrl = quest.photoUrl || '';

    state.formData = {
      ...state.formData,
      title: quest.title,
      description: quest.description,
      startingLat: quest.startingLatitude,
      startingLng: quest.startingLongitude,
      startRadius: quest.startingRadiusMeters,
      minParticipants: quest.minParticipantCount,
      maxParticipants: quest.maxParticipantCount,
      maxDuration: quest.maxDurationMinutes,
    };
  } catch (error: any) {
    state.uploadError = $t('quests.createQuest.errors.loadFailed');
  }
};

const handleCoverImageChange = (file: File | null): void => {
  state.coverImageFile = file;
};

const handleStepClick = (step: number): void => {
  if ((step === 2 || step === 3 || step === 4) && !state.questId) {
    state.uploadError = $t('quests.createQuest.errors.questNotCreated');
    return;
  }
  goToStep(state, step);
};

const handleBack = (): void => {
  goToPreviousStep(state);
};

const updateQuest = async (questId: number): Promise<boolean> => {
  state.isSubmitting = true;
  state.error = null;

  try {
    await questsApi.updateQuest(questId, {
      title: state.formData.title,
      description: state.formData.description,
      startingLatitude: state.formData.startingLat,
      startingLongitude: state.formData.startingLng,
      startingRadiusMeters: state.formData.startRadius,
      minParticipantCount: state.formData.minParticipants,
      maxParticipantCount: state.formData.maxParticipants,
      maxDurationMinutes: state.formData.maxDuration,
    });
    return true;
  } catch (error: any) {
    if (error.response?.status === 401) {
      state.uploadError = $t('quests.createQuest.errors.sessionExpired');
      router.replace({ name: 'login' });
    } else {
      state.uploadError = $t('quests.createQuest.errors.updateFailed');
    }
    return false;
  } finally {
    state.isSubmitting = false;
  }
};

const saveQuestInformation = async (): Promise<boolean> => {
  state.uploadError = '';
  successMessage.value = '';

  if (!questInformationStepRef.value?.validate()) {
    return false;
  }

  if (state.questId) {
    const updateSuccess = await updateQuest(state.questId);
    if (!updateSuccess) {
      return false;
    }

    if (state.coverImageFile) {
      const uploadSuccess = await uploadCoverImage(state.questId, state.coverImageFile);
      if (!uploadSuccess) {
        return false;
      }
    }

    await loadExistingQuest(state.questId);
    showTemporaryMessage(successMessage, $t('quests.createQuest.step1.saveSuccess'), 3000);
    return true;
  }

  const questId = await saveQuest();

  if (!questId) {
    return false;
  }

  state.questId = questId;

  if (state.coverImageFile) {
    const uploadSuccess = await uploadCoverImage(questId, state.coverImageFile);
    if (!uploadSuccess) {
      return false;
    }
    await loadExistingQuest(questId);
  }

  showTemporaryMessage(successMessage, $t('quests.createQuest.step1.saveSuccess'), 3000);
  return true;
};

const handleSaveQuestInformation = async (): Promise<void> => {
  await saveQuestInformation();
};

const handleNext = async (): Promise<void> => {
  if (state.currentStep === 1) {
    const isSaved = await saveQuestInformation();
    if (!isSaved) {
      return;
    }

    goToNextStep(state);
  } else if (state.currentStep === 4) {
    clearQuestDraft();
    router.replace({ name: 'my-quests' });
  } else {
    goToNextStep(state);
  }
};

const saveQuest = async (): Promise<number | null> => {
  state.isSubmitting = true;
  state.error = null;

  try {
    const response = await questsApi.createQuest({
      title: state.formData.title,
      description: state.formData.description,
      startingLatitude: state.formData.startingLat,
      startingLongitude: state.formData.startingLng,
      startingRadiusMeters: state.formData.startRadius,
      minParticipantCount: state.formData.minParticipants,
      maxParticipantCount: state.formData.maxParticipants,
      maxDurationMinutes: state.formData.maxDuration,
    });
    return response.questId;
  } catch (error: any) {
    if (error.response?.status === 401) {
      state.uploadError = $t('quests.createQuest.errors.sessionExpired');
      router.replace({ name: 'login' });
    } else {
      state.uploadError = $t('quests.createQuest.errors.saveFailed');
    }
    return null;
  } finally {
    state.isSubmitting = false;
  }
};

const uploadCoverImage = async (questId: number, file: File): Promise<boolean> => {
  state.isSubmitting = true;

  try {
    await questsApi.uploadCoverImage(questId, file);
    return true;
  } catch (error: any) {
    if (error.response?.status === 401) {
      state.uploadError = $t('quests.createQuest.errors.sessionExpired');
      router.replace({ name: 'login' });
    } else {
      state.uploadError = $t('quests.createQuest.errors.uploadFailed');
    }
    return false;
  } finally {
    state.isSubmitting = false;
  }
};

const handleCancel = (): void => {
  clearQuestDraft();
  router.replace({ name: 'my-quests' });
};

const getNextButtonText = (): string => {
  if (state.currentStep === 4) {
    return $t('quests.createQuest.submit');
  }
  return $t('common.next');
};
</script>