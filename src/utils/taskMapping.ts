import type { TaskResponse, Task, Question } from '@/types/task';

const DEFAULT_DURATION_MINUTES = 5;
const DEFAULT_MAX_POINTS = 100;
const DEFAULT_QUESTION_POINTS = 50;
const DEFAULT_SUCCESS_THRESHOLD = 80;

export const mapBackendTaskToLocal = (backendTask: TaskResponse): Task => {
    const baseTask = {
        questTaskId: backendTask.questTaskId,
        title: backendTask.description || '',
        maxPoints: String(backendTask.scorePointsCount ?? backendTask.maxScorePointsCount ?? DEFAULT_MAX_POINTS),
        duration: backendTask.maxDurationSeconds
            ? String(Math.floor(backendTask.maxDurationSeconds / 60))
            : String(DEFAULT_DURATION_MINUTES),
        requiredToUnlock: backendTask.isRequiredForNextPoint ?? false,
    };

    if (backendTask.taskType === 'quiz' && backendTask.quizQuestions) {
        const questions: Question[] = (backendTask.quizQuestions || [])
            .sort((a, b) => (a.orderNumber ?? 0) - (b.orderNumber ?? 0))
            .map((question, index) => ({
                id: String(question.quizQuestionId ?? index + 1),
                text: question.question || '',
                points: String(question.scorePointsCount ?? DEFAULT_QUESTION_POINTS),
                options: (question.answers || []).map((answer, answerIndex) => ({
                    id: String(answer.quizAnswerId ?? answerIndex + 1),
                    text: answer.answer || '',
                    isCorrect: answer.isCorrect ?? false,
                })),
            }));

        return {
            ...baseTask,
            type: 'quiz',
            successThreshold: String(backendTask.successScorePointsPercent ?? DEFAULT_SUCCESS_THRESHOLD),
            questions,
        };
    }

    if (backendTask.taskType === 'photo') {
        return {
            ...baseTask,
            type: 'photo',
            successThreshold: String(DEFAULT_SUCCESS_THRESHOLD),
            questions: [],
        };
    }

    if (backendTask.taskType === 'code_word' && backendTask.codeWord) {
        return {
            ...baseTask,
            type: 'code_word',
            successThreshold: String(DEFAULT_SUCCESS_THRESHOLD),
            questions: [],
            codeWord: backendTask.codeWord || '',
        };
    }

    return {
        ...baseTask,
        type: 'quiz',
        successThreshold: String(DEFAULT_SUCCESS_THRESHOLD),
        questions: [],
    };
};
