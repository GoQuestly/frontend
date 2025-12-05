import { reactive, computed, ref, onMounted, watch, toRef } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { questsApi } from '@/api/questsApi';
import { sessionApi } from '@/api/sessionApi';
import { showTemporaryMessage } from '@/utils/messages';
import { provideConfirmDialog, type ConfirmOptions } from '@/composables/useConfirmDialog';
import { getDefaultCoordinates } from '@/utils/geolocation';
import type { QuestFormData, CreateQuestState } from '@/types/form';

const API_URL = import.meta.env.VITE_API_URL || '';

const createInitialFormData = (): QuestFormData => {
  const defaultCoords = getDefaultCoordinates();
  return {
    title: '',
    description: '',
    coverImage: null,
    startingLat: defaultCoords.lat,
    startingLng: defaultCoords.lng,
    startRadius: 50,
    minParticipants: 1,
    maxParticipants: 50,
    maxDuration: 120,
    checkpoints: [],
    tasks: [],
  };
};

const createInitialState = (): CreateQuestState => ({
  currentStep: 1,
  formData: createInitialFormData(),
  isSubmitting: false,
  error: null,
});

const goToNextStep = (state: CreateQuestState, maxStep: number = 4): void => {
  if (state.currentStep < maxStep) {
    state.currentStep++;
  }
};

const goToPreviousStep = (state: CreateQuestState): void => {
  if (state.currentStep > 1) {
    state.currentStep--;
  }
};

const goToStep = (state: CreateQuestState, step: number, maxStep: number = 4): void => {
  if (step >= 1 && step <= maxStep) {
    state.currentStep = step;
  }
};

const QUEST_DRAFT_STORAGE_KEY = 'createQuestDraft';
type QuestFormState = ReturnType<typeof createInitialState>;
type PersistedFormData = Omit<QuestFormState['formData'], 'coverImage'>;
type QuestDraftSnapshot = {
  currentStep: number;
  questId: number | null;
  photoUrl: string;
  formData: PersistedFormData;
};

type QuestInformationFields = Pick<QuestFormData,
  'title' |
  'description' |
  'startingLat' |
  'startingLng' |
  'startRadius' |
  'minParticipants' |
  'maxParticipants' |
  'maxDuration'
>;

interface Props {
  mode?: 'create' | 'edit';
  questId?: number | null;
}

export const useCreateQuestView = (props: Props) => {
  const router = useRouter();
  const route = useRoute();
  const { t: $t } = useI18n();

  const isEditMode = computed(() => props.mode === 'edit');
  const translateWithFallback = (key: string, fallback: string): string => {
    const translated = $t(key as never) as string;
    return translated === key ? fallback : translated;
  };

  const headerTitle = computed(() => isEditMode.value
      ? translateWithFallback('quests.createQuest.editTitle', 'Edit Quest')
      : $t('quests.createQuest.title'));
  const headerSubtitle = computed(() => isEditMode.value
      ? translateWithFallback(
          'quests.createQuest.editSubtitle',
          'Update your quest details, checkpoints, and tasks'
      )
      : $t('quests.createQuest.subtitle'));

  const state = reactive({
    ...createInitialState(),
    uploadError: '',
    coverImageFile: null as File | null,
    questId: props.questId ?? null as number | null,
    photoUrl: '' as string,
    isLoadingQuest: false,
  });

  const successMessage = ref('');
  const questInformationStepRef = ref<any>(null);
  const checkpointsSetupStepRef = ref<any>(null);
  const confirmDialogState = reactive({
    visible: false,
    title: '',
    message: '',
    confirmText: '',
    cancelText: '',
    workingText: '',
    tone: 'default' as 'default' | 'danger',
  });
  let confirmResolver: ((value: boolean) => void) | null = null;

  const QUEST_INFO_FIELD_KEYS: Array<keyof QuestInformationFields> = [
    'title',
    'description',
    'startingLat',
    'startingLng',
    'startRadius',
    'minParticipants',
    'maxParticipants',
    'maxDuration',
  ];

  const getQuestIdFromRoute = (): number | null => {
    const questIdParam = route.query.questId as string | undefined;
    const questIdFromQuery = questIdParam ? parseInt(questIdParam, 10) : null;
    const questIdFromParams = route.params.questId ? parseInt(route.params.questId as string, 10) : null;

    if (questIdFromQuery !== null && !Number.isNaN(questIdFromQuery)) {
      return questIdFromQuery;
    }

    if (questIdFromParams !== null && !Number.isNaN(questIdFromParams)) {
      return questIdFromParams;
    }

    return null;
  };

  const getCurrentQuestId = (): number | null => {
    const questId = state.questId ?? props.questId ?? getQuestIdFromRoute();
    return questId !== null && !Number.isNaN(questId) ? questId : null;
  };

  const hasQuestId = computed(() => getCurrentQuestId() !== null);

  const ensureQuestLoadedForEditMode = (): boolean => {
    if (!isEditMode.value) {
      return true;
    }

    if (!hasQuestId.value) {
      state.uploadError = translateWithFallback(
          'quests.createQuest.errors.questNotLoaded',
          'Load the quest before continuing.'
      );
      return false;
    }

    return true;
  };

  const openConfirmDialog = (options: ConfirmOptions): Promise<boolean> => {
    confirmDialogState.title = options.title;
    confirmDialogState.message = options.message;
    confirmDialogState.confirmText = options.confirmText;
    confirmDialogState.cancelText = options.cancelText;
    confirmDialogState.workingText = options.workingText ?? options.confirmText;
    confirmDialogState.tone = options.tone ?? 'default';
    confirmDialogState.visible = true;

    return new Promise<boolean>((resolve) => {
      confirmResolver = resolve;
    });
  };

  const handleConfirmApprove = (): void => {
    confirmDialogState.visible = false;
    confirmResolver?.(true);
    confirmResolver = null;
  };

  const handleConfirmCancel = (): void => {
    confirmDialogState.visible = false;
    confirmResolver?.(false);
    confirmResolver = null;
  };

  provideConfirmDialog(openConfirmDialog);

  const getQuestInformationFormValues = (): QuestInformationFields | null => {
    if (!questInformationStepRef.value?.getFormValues) {
      return null;
    }
    return questInformationStepRef.value.getFormValues();
  };

  const clearPendingCoverImage = (): void => {
    state.coverImageFile = null;
  };

  const hasUnsavedQuestInformation = (): boolean => {
    const formValues = getQuestInformationFormValues();
    if (!formValues) {
      return false;
    }

    return QUEST_INFO_FIELD_KEYS.some((key) => formValues[key] !== state.formData[key]);
  };

  const resetQuestInformationForm = (): void => {
    questInformationStepRef.value?.resetToModelValue?.();
    clearPendingCoverImage();
  };

  const getPersistableFormData = (): PersistedFormData => {
    const { coverImage, ...persistableFormData } = state.formData;
    return { ...persistableFormData };
  };

  const persistQuestDraft = (): void => {
    if (isEditMode.value) {
      return;
    }

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
    state.currentStep = Math.min(draft.currentStep ?? 1, maxStep.value);
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

  const prepareNavigationToStep = (targetStep: number): boolean => {
    if (targetStep > maxStep.value) {
      return false;
    }
    const uploadErrorRef = toRef(state, 'uploadError');
    if (targetStep > 1 && !state.questId) {
      showTemporaryMessage(
          uploadErrorRef,
          translateWithFallback(
              'quests.createQuest.errors.saveBeforeNext',
              'Save your changes before moving to the next step.'
          ),
          4000
      );
      return false;
    }

    if (state.currentStep === 1 && targetStep > 1 && hasUnsavedQuestInformation()) {
      resetQuestInformationForm();
    }

    return true;
  };

  const steps = computed(() => {
    const baseSteps = [
      { number: 1, label: $t('quests.createQuest.steps.information') },
      { number: 2, label: $t('quests.createQuest.steps.checkpoints') },
      { number: 3, label: $t('quests.createQuest.steps.tasks') },
    ];

    return isEditMode.value
        ? baseSteps
        : [...baseSteps, { number: 4, label: $t('quests.createQuest.steps.review') }];
  });

  const maxStep = computed(() => (isEditMode.value ? 3 : 4));

  const coverImagePreview = computed(() => {
    if (state.coverImageFile) {
      return URL.createObjectURL(state.coverImageFile);
    }
    return state.photoUrl || '';
  });

  const loadExistingQuest = async (questId: number): Promise<void> => {
    state.isLoadingQuest = true;
    state.uploadError = '';
    try {
      const quest = await questsApi.getQuestById(questId);

      state.questId = quest.questId;

      // Fix photoUrl if it's a relative path
      if (quest.photoUrl) {
        state.photoUrl = quest.photoUrl.startsWith('http')
          ? quest.photoUrl
          : `${API_URL}${quest.photoUrl.startsWith('/') ? quest.photoUrl.slice(1) : quest.photoUrl}`;
      } else {
        state.photoUrl = '';
      }

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
      clearPendingCoverImage();
    } catch (error: any) {
      state.uploadError = $t('quests.createQuest.errors.loadFailed');
    } finally {
      state.isLoadingQuest = false;
    }
  };

  const handleCoverImageChange = (file: File | null): void => {
    state.coverImageFile = file;
  };

  const handleStepClick = (step: number): void => {
    if (!prepareNavigationToStep(step)) {
      return;
    }
    goToStep(state, step, maxStep.value);
  };

  const handleBack = (): void => {
    goToPreviousStep(state);
  };

  const openDeleteConfirm = async (): Promise<void> => {
    if (!ensureQuestLoadedForEditMode()) {
      return;
    }

    const confirmed = await openConfirmDialog({
      title: translateWithFallback('common.delete', 'Delete'),
      message: translateWithFallback(
          'quests.createQuest.confirmations.deleteQuest',
          'Delete this quest? This cannot be undone and the data will be lost permanently.'
      ),
      confirmText: translateWithFallback('common.delete', 'Delete'),
      cancelText: translateWithFallback('common.cancel', 'Cancel'),
      workingText: translateWithFallback('common.confirming', 'Confirming...'),
      tone: 'danger',
    });

    if (confirmed) {
      await handleDeleteQuest();
    }
  };

  const deleteQuestDependencies = async (questId: number): Promise<void> => {
    try {
      const checkpoints = await questsApi.getCheckpoints(questId);

      for (const checkpoint of checkpoints) {
        const taskId = checkpoint.task?.questTaskId;
        if (taskId) {
          try {
            await questsApi.deleteTask(taskId);
          } catch {}
        }
        try {
          await questsApi.deleteCheckpoint(checkpoint.questPointId);
        } catch {}
      }
    } catch (error: any) {
      state.uploadError = translateWithFallback(
          'quests.createQuest.errors.deleteDependenciesFailed',
          'Failed to remove quest items before deletion.'
      );
      throw error;
    }
  };

  const checkActiveSessions = async (questId: number): Promise<boolean> => {
    try {
      const sessionsResponse = await sessionApi.getQuestSessions(questId, 1, 100);
      return (sessionsResponse.items || []).some((session: any) => session.isActive);
    } catch {
      return false;
    }
  };

  const handleBackToSessions = (): void => {
    const questId = getCurrentQuestId();

    if (!questId) {
      state.uploadError = translateWithFallback(
          'quests.createQuest.errors.questNotLoaded',
          'Load the quest before continuing.'
      );
      return;
    }

    router.replace({ name: 'quest-sessions', params: { questId } });
  };

  const handleDeleteQuest = async (): Promise<void> => {
    if (!ensureQuestLoadedForEditMode()) {
      return;
    }

    const questId = getCurrentQuestId();
    if (!questId) {
      return;
    }

    state.isSubmitting = true;
    state.uploadError = '';

    try {
      const hasActiveSessions = await checkActiveSessions(questId);
      if (hasActiveSessions) {
        const uploadErrorRef = toRef(state, 'uploadError');
        showTemporaryMessage(
            uploadErrorRef,
            translateWithFallback(
                'quests.createQuest.errors.activeSessions',
                'This quest has active sessions and cannot be deleted.'
            ),
            4000
        );
        return;
      }

      await deleteQuestDependencies(questId);
      await questsApi.deleteQuest(questId);
      clearQuestDraft();
      router.replace({ name: 'my-quests' });
    } catch (error: any) {
      if (error.response?.status === 401) {
        state.uploadError = $t('quests.createQuest.errors.sessionExpired');
        router.replace({ name: 'login' });
      } else {
        state.uploadError = translateWithFallback(
            'quests.createQuest.errors.deleteFailed',
            'Failed to delete quest. Please try again.'
        );
      }
    } finally {
      state.isSubmitting = false;
    }
  };

  const updateQuest = async (questId: number, formValues: QuestInformationFields): Promise<boolean> => {
    state.isSubmitting = true;
    state.error = null;

    try {
      await questsApi.updateQuest(questId, {
        title: formValues.title,
        description: formValues.description,
        startingLatitude: formValues.startingLat,
        startingLongitude: formValues.startingLng,
        startingRadiusMeters: formValues.startRadius,
        minParticipantCount: formValues.minParticipants,
        maxParticipantCount: formValues.maxParticipants,
        maxDurationMinutes: formValues.maxDuration,
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

    if (!ensureQuestLoadedForEditMode()) {
      return false;
    }

    if (!questInformationStepRef.value?.validate()) {
      return false;
    }

    const formValues = getQuestInformationFormValues();
    if (!formValues) {
      return false;
    }

    const questIdForUpdate = getCurrentQuestId();

    if (questIdForUpdate) {
      const updateSuccess = await updateQuest(questIdForUpdate, formValues);
      if (!updateSuccess) {
        return false;
      }

      state.questId = questIdForUpdate;

      state.formData = {
        ...state.formData,
        ...formValues,
      };

      if (state.coverImageFile) {
        const uploadSuccess = await uploadCoverImage(questIdForUpdate, state.coverImageFile);
        if (!uploadSuccess) {
          return false;
        }
      }

      await loadExistingQuest(questIdForUpdate);

      if (isEditMode.value) {
        clearQuestDraft();
      }

      showTemporaryMessage(successMessage, $t('quests.createQuest.step1.saveSuccess'), 3000);
      return true;
    }

    if (isEditMode.value) {
      state.uploadError = translateWithFallback(
          'quests.createQuest.errors.questNotLoaded',
          'Load the quest before continuing.'
      );
      return false;
    }

    const questId = await saveQuest(formValues);

    if (!questId) {
      return false;
    }

    state.questId = questId;

    if (state.coverImageFile) {
      const uploadSuccess = await uploadCoverImage(questId, state.coverImageFile);
      if (!uploadSuccess) {
        return false;
      }
    }

    await loadExistingQuest(questId);

    showTemporaryMessage(successMessage, $t('quests.createQuest.step1.saveSuccess'), 3000);
    return true;
  };

  const handleSaveQuestInformation = async (): Promise<void> => {
    await saveQuestInformation();
  };

  const handleNext = async (): Promise<void> => {
    if (state.currentStep === 1) {
      if (!prepareNavigationToStep(state.currentStep + 1)) {
        return;
      }

      goToNextStep(state, maxStep.value);
    } else if (state.currentStep === 2 && !isEditMode.value) {
      if (state.formData.checkpoints.length === 0) {
        const uploadErrorRef = toRef(state, 'uploadError');
        showTemporaryMessage(
            uploadErrorRef,
            translateWithFallback(
                'quests.createQuest.errors.noCheckpoints',
                'Please add at least one checkpoint.'
            ),
            4000
        );
        return;
      }
      goToNextStep(state, maxStep.value);
    } else if (!isEditMode.value && state.currentStep === 4) {
      clearQuestDraft();
      router.replace({ name: 'my-quests' });
    } else if (isEditMode.value && state.currentStep === maxStep.value) {
      router.replace({ name: 'my-quests' });
    } else {
      goToNextStep(state, maxStep.value);
    }
  };

  const saveQuest = async (formValues: QuestInformationFields): Promise<number | null> => {
    state.isSubmitting = true;
    state.error = null;

    try {
      const response = await questsApi.createQuest({
        title: formValues.title,
        description: formValues.description,
        startingLatitude: formValues.startingLat,
        startingLongitude: formValues.startingLng,
        startingRadiusMeters: formValues.startRadius,
        minParticipantCount: formValues.minParticipants,
        maxParticipantCount: formValues.maxParticipants,
        maxDurationMinutes: formValues.maxDuration,
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
    if (state.currentStep === maxStep.value) {
      return isEditMode.value ? $t('common.save') : $t('quests.createQuest.submit');
    }
    return $t('common.next');
  };

  onMounted(async () => {
    const questId = props.questId ?? getQuestIdFromRoute();
    const restoredDraft = readQuestDraft();
    const draftForUse = isEditMode.value ? null : restoredDraft;

    if (draftForUse) {
      applyDraftToState(draftForUse);
    }

    if (isEditMode.value && questId !== null && restoredDraft?.questId === questId) {
      clearQuestDraft();
    }

    if (questId !== null && (!draftForUse || draftForUse.questId !== questId)) {
      await loadExistingQuest(questId);

      const stepFromQuery = route.query.step as string | undefined;
      if (stepFromQuery) {
        const step = parseInt(stepFromQuery, 10);
        if (!Number.isNaN(step) && step >= 1 && step <= maxStep.value) {
          state.currentStep = step;
        }
      }
    } else if (isEditMode.value && questId === null) {
      state.uploadError = translateWithFallback(
          'quests.createQuest.errors.questNotLoaded',
          'Load the quest before continuing.'
      );
    }
  });

  return {
    state,
    isEditMode,
    headerTitle,
    headerSubtitle,
    hasQuestId,
    successMessage,
    questInformationStepRef,
    checkpointsSetupStepRef,
    confirmDialogState,
    steps,
    maxStep,
    coverImagePreview,
    handleCoverImageChange,
    handleStepClick,
    handleBack,
    handleBackToSessions,
    openDeleteConfirm,
    handleSaveQuestInformation,
    handleNext,
    handleCancel,
    getNextButtonText,
    handleConfirmApprove,
    handleConfirmCancel,
  };
};
