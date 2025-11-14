export interface CheckpointResponse {
    questPointId: number;
    name: string;
    latitude: number;
    longitude: number;
    orderNum: number;
    questTaskId?: number;
    task?: {
        questTaskId: number;
        taskType: 'quiz' | 'photo' | 'text' | 'code_word';
        description: string;
        maxDurationSeconds: number;
        isRequiredForNextPoint: boolean;
        scorePointsCount?: number;
        maxScorePointsCount?: number;
        successScorePointsPercent?: number;
        codeWord?: string;
        quizQuestions?: any[];
    };
}


export interface CreateCheckpointRequest {
    name: string;
    latitude: number;
    longitude: number;
    orderNum: number;
}

export interface CreateCheckpointResponse {
    name: string;
    latitude: number;
    longitude: number;
    orderNum: number;
    quest: import('./quests').QuestResponse;
    questPointId: number;
}

export interface UpdateCheckpointRequest {
    name?: string;
    latitude?: number;
    longitude?: number;
    orderNum?: number;
}

export interface QuestCheckpoint {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    requiredForNext: boolean;
    questPointId?: number;
}