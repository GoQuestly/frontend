import {QuestCheckpoint} from "@/types/checkpoint.ts";

export interface AnswerOption {
    id: string;
    text: string;
    isCorrect: boolean;
}

export interface Question {
    id: string;
    text: string;
    options: AnswerOption[];
    points: string;
}

export interface Task {
    questTaskId?: number;
    type: 'quiz' | 'photo' | 'code_word' | '';
    title: string;
    maxPoints: string;
    duration: string;
    successThreshold: string;
    requiredToUnlock: boolean;
    questions: Question[];
    codeWord?: string;
}

export interface CheckpointWithTask extends QuestCheckpoint {
    task: Task | null;
}

export interface TaskResponse {
    questTaskId: number;
    taskType: 'quiz' | 'photo' | 'text' | 'code_word';
    description: string;
    maxDurationSeconds: number | null;
    isRequiredForNextPoint: boolean;
    maxScorePointsCount?: number;
    scorePointsCount?: number;
    successScorePointsPercent?: number;
    codeWord?: string;
    quizQuestions?: Array<{
        quizQuestionId: number;
        question: string;
        orderNumber: number;
        scorePointsCount: number;
        answers: Array<{
            quizAnswerId: number;
            answer: string;
            isCorrect: boolean;
        }>;
    }>;
}

export interface QuizAnswer {
    answer: string;
    isCorrect: boolean;
}

export interface QuizQuestion {
    question: string;
    orderNumber: number;
    scorePointsCount: number;
    answers: QuizAnswer[];
}

export interface CreateQuizTaskRequest {
    description: string;
    maxDurationSeconds?: number;
    isRequiredForNextPoint: boolean;
    maxScorePointsCount: number;
    successScorePointsPercent: number;
    quizQuestions: QuizQuestion[];
}

export interface UpdateQuizTaskRequest {
    description?: string;
    maxDurationSeconds?: number;
    isRequiredForNextPoint?: boolean;
    maxScorePointsCount?: number;
    successScorePointsPercent?: number;
    quizQuestions?: QuizQuestion[];
}

export interface CreatePhotoTaskRequest {
    description: string;
    maxDurationSeconds?: number;
    isRequiredForNextPoint: boolean;
    scorePointsCount: number;
}

export interface UpdatePhotoTaskRequest {
    description?: string;
    maxDurationSeconds?: number;
    isRequiredForNextPoint?: boolean;
    scorePointsCount?: number;
}

export interface CreateCodeWordTaskRequest {
    description: string;
    maxDurationSeconds?: number;
    isRequiredForNextPoint: boolean;
    scorePointsCount: number;
    codeWord: string;
}

export interface UpdateCodeWordTaskRequest {
    description?: string;
    maxDurationSeconds?: number;
    isRequiredForNextPoint?: boolean;
    scorePointsCount?: number;
    codeWord?: string;
}