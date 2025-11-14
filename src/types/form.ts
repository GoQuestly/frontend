import type { QuestCheckpoint } from './checkpoint';
import type { Task } from './task';

export interface QuestFormData {
    title: string;
    description: string;
    coverImage: File | null;
    startingLat: number;
    startingLng: number;
    startRadius: number;
    publicProgressVisibility: boolean;
    minParticipants: number;
    maxParticipants: number;
    maxDuration: number;
    checkpoints: QuestCheckpoint[];
    tasks: Array<{
        checkpointId: string;
        task: Task | null;
    }>;
}

export interface CreateQuestState {
    currentStep: number;
    formData: QuestFormData;
    isSubmitting: boolean;
    error: string | null;
}