import type { QuestFormData, CreateQuestState } from '@/types/form';

export const createInitialFormData = (): QuestFormData => ({
    title: '',
    description: '',
    coverImage: null,
    startingLat: 40.7128,
    startingLng: -74.0060,
    startRadius: 50,
    publicProgressVisibility: true,
    minParticipants: 1,
    maxParticipants: 50,
    maxDuration: 120,
    checkpoints: [],
    tasks: [],
});

export const createInitialState = (): CreateQuestState => ({
    currentStep: 1,
    formData: createInitialFormData(),
    isSubmitting: false,
    error: null,
});

export const goToNextStep = (state: CreateQuestState): void => {
    if (state.currentStep < 4) {
        state.currentStep++;
    }
};

export const goToPreviousStep = (state: CreateQuestState): void => {
    if (state.currentStep > 1) {
        state.currentStep--;
    }
};

export const goToStep = (state: CreateQuestState, step: number): void => {
    if (step >= 1 && step <= 4) {
        state.currentStep = step;
    }
};