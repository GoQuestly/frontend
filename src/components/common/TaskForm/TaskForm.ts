import {ref, computed} from 'vue';
import {questsApi} from '@/api/questsApi';
import {useI18n} from 'vue-i18n';
import {createNotificationHelpers} from '@/utils/messages';
import {validateNumberRange, parseNumber} from '@/utils/validation';
import type {CheckpointWithTask, Task} from '@/types/task';

export interface Props {
    checkpoint: CheckpointWithTask;
    titleOnly?: boolean;
}

export interface Emits {
    (e: 'update-task', task: Task): void;

    (e: 'remove-task'): void;
}

const MAX_TASK_DURATION_SECONDS = 86400;
const MAX_POINTS = 10000;

export function useTaskForm(props: Props, emit: Emits) {
    const {t} = useI18n();

    const localTask = ref<Task>({...props.checkpoint.task!});
    const isSaving = ref(false);
    const errorMessage = ref('');
    const successMessage = ref('');

    const errorKeys = ref({
        type: '',
        title: '',
        maxPoints: '',
        duration: '',
        successThreshold: '',
        codeWord: '',
        questions: {} as { [key: number]: { text: string; points: string; answers: string } },
    });

    const errors = computed(() => ({
        type: errorKeys.value.type ? t(errorKeys.value.type) : '',
        title: errorKeys.value.title ? t(errorKeys.value.title) : '',
        maxPoints: errorKeys.value.maxPoints ? t(errorKeys.value.maxPoints) : '',
        duration: errorKeys.value.duration ? t(errorKeys.value.duration, {max: MAX_TASK_DURATION_SECONDS / 60}) : '',
        successThreshold: errorKeys.value.successThreshold ? t(errorKeys.value.successThreshold) : '',
        codeWord: errorKeys.value.codeWord ? t(errorKeys.value.codeWord) : '',
        questions: Object.keys(errorKeys.value.questions).reduce((acc, key) => {
            const qIndex = parseInt(key);
            const qErrors = errorKeys.value.questions[qIndex];
            acc[qIndex] = {
                text: qErrors?.text ? t(qErrors.text) : '',
                points: qErrors?.points ? t(qErrors.points) : '',
                answers: qErrors?.answers ? t(qErrors.answers) : '',
            };
            return acc;
        }, {} as { [key: number]: { text: string; points: string; answers: string } }),
    }));

    const {showError} = createNotificationHelpers(errorMessage, successMessage);

    const clearValidationErrors = () => {
        errorKeys.value = {
            type: '',
            title: '',
            maxPoints: '',
            duration: '',
            successThreshold: '',
            codeWord: '',
            questions: {},
        };
    };

    const emitUpdate = (): void => {
        emit('update-task', {...localTask.value});
    };

    const handleTypeChange = (): void => {
        clearValidationErrors();

        if (localTask.value.type === 'quiz') {
            if (!localTask.value.questions || localTask.value.questions.length === 0) {
                localTask.value.questions = [
                    {
                        id: Date.now().toString(),
                        text: '',
                        points: '50',
                        options: [
                            {id: '1', text: '', isCorrect: true},
                            {id: '2', text: '', isCorrect: false},
                        ],
                    },
                ];
            }
            if (!localTask.value.successThreshold) {
                localTask.value.successThreshold = '80';
            }
            if (!localTask.value.duration) {
                localTask.value.duration = '5';
            }
            localTask.value.maxPoints = '0';
        }

        if (localTask.value.type !== 'code_word') {
            localTask.value.codeWord = undefined;
        }
        if (localTask.value.type !== 'quiz') {
            localTask.value.questions = [];
        }

        emitUpdate();
    };

    const validateQuiz = (): boolean => {
        clearValidationErrors();
        let isValid = true;

        const thresholdValidation = validateNumberRange(localTask.value.successThreshold, 0, 100); // Percentage
        if (!thresholdValidation.isValid) {
            errorKeys.value.successThreshold = 'quests.createQuest.step3.errors.successThresholdRange';
            isValid = false;
        }

        const questionErrors: { [key: number]: { text: string; points: string; answers: string } } = {};

        for (let i = 0; i < (localTask.value.questions?.length || 0); i++) {
            const q = localTask.value.questions[i];
            const qErrors = {text: '', points: '', answers: ''};

            const pointsValidation = validateNumberRange(q.points, 0, MAX_POINTS);
            if (!pointsValidation.isValid) {
                qErrors.points = 'quests.createQuest.step3.errors.questionPointsRange';
                isValid = false;
            }

            if (qErrors.text || qErrors.points || qErrors.answers) {
                questionErrors[i] = qErrors;
            }
        }

        if (Object.keys(questionErrors).length > 0) {
            errorKeys.value.questions = questionErrors;
        }

        return isValid;
    };

    const validatePhoto = (): boolean => {
        clearValidationErrors();
        let isValid = true;
        const pointsValidation = validateNumberRange(localTask.value.maxPoints, 0, MAX_POINTS);
        if (!pointsValidation.isValid) {
            errorKeys.value.maxPoints = 'quests.createQuest.step3.errors.scorePointsMin';
            isValid = false;
        }

        return isValid;
    };

    const validateCodeWord = (): boolean => {
        clearValidationErrors();
        let isValid = true;


        if (!localTask.value.codeWord || localTask.value.codeWord.trim().length === 0) {
            errorKeys.value.codeWord = 'quests.createQuest.step3.errors.codeWordRequired';
            isValid = false;
        }

        const pointsValidation = validateNumberRange(localTask.value.maxPoints, 0, MAX_POINTS);
        if (!pointsValidation.isValid) {
            errorKeys.value.maxPoints = 'quests.createQuest.step3.errors.scorePointsMin';
            isValid = false;
        }

        return isValid;
    };

    const validateTask = (): boolean => {

        if (!localTask.value.type) {
            errorKeys.value.type = 'quests.createQuest.step3.errors.typeRequired';
            return false;
        }

        switch (localTask.value.type) {
            case 'quiz':
                return validateQuiz();
            case 'photo':
                return validatePhoto();
            case 'code_word':
                return validateCodeWord();
            default:
                errorKeys.value.type = 'quests.createQuest.step3.errors.typeInvalid';
                return false;
        }
    };

    const handleSave = async (): Promise<void> => {

        if (!props.checkpoint.questPointId) {
            showError(t('quests.createQuest.step3.errors.checkpointNotFound'));
            return;
        }

        if (!validateTask()) {
            return;
        }

        isSaving.value = true;

        try {
            const baseData = {
                description: localTask.value.title.trim(),
                maxDurationSeconds: localTask.value.duration ? parseNumber(localTask.value.duration) * 60 : 0,
                isRequiredForNextPoint: localTask.value.requiredToUnlock,
            };

            const taskId = localTask.value.questTaskId;

            switch (localTask.value.type) {
                case 'quiz': {
                    const quizQuestions = localTask.value.questions
                        .filter(q => q.text.trim() && q.options.some(opt => opt.text.trim()))
                        .map((q, index) => ({
                            question: q.text.trim(),
                            orderNumber: index + 1,
                            scorePointsCount: parseNumber(q.points),
                            answers: q.options
                                .filter(opt => opt.text.trim())
                                .map(opt => ({
                                    answer: opt.text.trim(),
                                    isCorrect: opt.isCorrect,
                                })),
                        }));

                    if (taskId) {
                        await questsApi.updateQuizTask(taskId, {
                            ...baseData,
                            successScorePointsPercent: parseNumber(localTask.value.successThreshold),
                            quizQuestions,
                        });
                    } else {
                        const response = await questsApi.createQuizTask(props.checkpoint.questPointId, {
                            ...baseData,
                            successScorePointsPercent: parseNumber(localTask.value.successThreshold),
                            quizQuestions,
                        });
                        localTask.value.questTaskId = response.questTaskId;
                    }
                    break;
                }

                case 'photo': {
                    if (taskId) {
                        await questsApi.updatePhotoTask(taskId, {
                            ...baseData,
                            scorePointsCount: parseNumber(localTask.value.maxPoints),
                        });
                    } else {
                        const response = await questsApi.createPhotoTask(props.checkpoint.questPointId, {
                            ...baseData,
                            scorePointsCount: parseNumber(localTask.value.maxPoints),
                        });
                        localTask.value.questTaskId = response.questTaskId;
                    }
                    break;
                }

                case 'code_word': {
                    if (taskId) {
                        await questsApi.updateCodeWordTask(taskId, {
                            ...baseData,
                            scorePointsCount: parseNumber(localTask.value.maxPoints),
                            codeWord: localTask.value.codeWord!.trim(),
                        });
                    } else {
                        const response = await questsApi.createCodeWordTask(props.checkpoint.questPointId, {
                            ...baseData,
                            scorePointsCount: parseNumber(localTask.value.maxPoints),
                            codeWord: localTask.value.codeWord!.trim(),
                        });
                        localTask.value.questTaskId = response.questTaskId;
                    }
                    break;
                }
            }

            clearValidationErrors();
            emitUpdate();
        } catch (error: any) {
            showError(error?.response?.data?.message || t('quests.createQuest.step3.errors.taskSaveFailed'));
        } finally {
            isSaving.value = false;
        }
    };

    return {
        localTask,
        isSaving,
        errorMessage,
        successMessage,
        errors,
        handleTypeChange,
        handleSave,
        emitUpdate,
    };
}
