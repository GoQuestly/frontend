import { ref, watch, onMounted } from 'vue';
import { questsApi } from '@/api/questsApi';
import { createNotificationHelpers } from '@/utils/messages';
import { useI18n } from 'vue-i18n';
import type { QuestFormData } from '@/types/form';
import type {
    CheckpointWithTask, Task, CreateQuizTaskRequest, CreatePhotoTaskRequest, CreateCodeWordTaskRequest,
    TaskResponse
} from '@/types/task';
import { mapBackendTaskToLocal } from '@/utils/taskMapping';
import { confirmWithTranslation } from '@/utils/dialogs';
import { parseNumber } from '@/utils/validation';


interface Props {
    modelValue: QuestFormData;
    questId: number | null;
}

interface Emit {
    (e: 'update:modelValue', value: QuestFormData): void;
}

    const createEmptyTask = (): Task => ({
        type: 'quiz',
        title: '',
        maxPoints: '100',
        duration: '5',
        successThreshold: '80',
        requiredToUnlock: false,
        questions: [
            {
                id: '1',
                text: '',
                points: '50',
                options: [
                    { id: '1', text: '', isCorrect: false },
                    { id: '2', text: '', isCorrect: false },
                ],
            },
        ],
    });

export const useTaskAssignment = (props: Props, emit: Emit) => {
    const { t } = useI18n();
    const expandedCheckpointId = ref<string | null>(null);
    const checkpointTasks = ref<Map<string, Task | null>>(new Map());
    const isSaving = ref(false);
    const isLoading = ref(false);
    const errorMessage = ref('');
    const successMessage = ref('');

    const { showError, showSuccess } = createNotificationHelpers(errorMessage, successMessage);

    const loadTasks = async (): Promise<void> => {
        if (!props.questId) {
            initializeEmptyTasks();
            return;
        }

        isLoading.value = true;

        try {
            const points = await questsApi.getCheckpoints(props.questId);

            checkpointTasks.value.clear();

            props.modelValue.checkpoints.forEach((checkpoint) => {
                const point = points.find((p: any) => p.questPointId === checkpoint.questPointId);

                if (!point) {
                    checkpointTasks.value.set(checkpoint.id, null);
                    return;
                }

                if (!point.task || !point.task.questTaskId) {
                    checkpointTasks.value.set(checkpoint.id, null);
                    return;
                }

                const taskResponse: TaskResponse = {
                    questTaskId: point.task.questTaskId,
                    taskType: point.task.taskType as 'quiz' | 'photo' | 'text' | 'code_word',
                    description: point.task.description,
                    maxDurationSeconds: point.task.maxDurationSeconds,
                    isRequiredForNextPoint: point.task.isRequiredForNextPoint,
                    scorePointsCount: point.task.scorePointsCount,
                    maxScorePointsCount: point.task.maxScorePointsCount,
                    successScorePointsPercent: point.task.successScorePointsPercent,
                    codeWord: point.task.codeWord,
                    quizQuestions: point.task.quizQuestions,
                };

                const task = mapBackendTaskToLocal(taskResponse);
                checkpointTasks.value.set(checkpoint.id, task);
            });

            saveTasksToFormData();
        } catch (error: any) {
            if (error.response?.status !== 404) {
                showError(t('quests.createQuest.step3.errors.taskLoadFailed') || 'Failed to load tasks');
            }
            initializeEmptyTasks();
        } finally {
            isLoading.value = false;
        }
    };

    const initializeEmptyTasks = () => {
        checkpointTasks.value.clear();
        props.modelValue.checkpoints.forEach(cp => {
            checkpointTasks.value.set(cp.id, null);
        });
    };

    onMounted(() => {

        if (props.questId) {
            loadTasks();
        } else {
            initializeEmptyTasks();
        }
    });

    watch(() => props.questId, (newQuestId, oldQuestId) => {

        if (newQuestId && newQuestId !== oldQuestId) {
            loadTasks();
        }
    }, { immediate: true });

    watch(() => props.modelValue.checkpoints, (newCheckpoints) => {
        newCheckpoints.forEach(cp => {
            if (!checkpointTasks.value.has(cp.id)) {
                checkpointTasks.value.set(cp.id, null);
            }
        });
    }, { deep: true });

    const saveTasksToFormData = () => {
        const tasks = Array.from(checkpointTasks.value.entries())
            .filter(([_, task]) => task !== null)
            .map(([checkpointId, task]) => ({
                checkpointId,
                task: task!,
            }));

        emit('update:modelValue', {
            ...props.modelValue,
            tasks,
        });
    };

    const getCheckpoints = (): CheckpointWithTask[] => {
        return props.modelValue.checkpoints.map(cp => ({
            ...cp,
            task: checkpointTasks.value.get(cp.id) || null,
        }));
    };

    const toggleCheckpoint = (id: string): void => {
        expandedCheckpointId.value = expandedCheckpointId.value === id ? null : id;
    };

    const saveTaskToBackend = async (
        checkpoint: CheckpointWithTask,
        isUpdate: boolean = false
    ): Promise<any> => {
        if (!checkpoint.task || !checkpoint.questPointId) {
            throw new Error('Invalid checkpoint or task data');
        }

        const task = checkpoint.task;

        if (!task.type) {
            throw new Error('Please select a task type');
        }

        const baseData = {
            description: task.title || 'Untitled Task',
            maxDurationSeconds: task.duration ? parseNumber(task.duration, 0) * 60 : undefined,
            isRequiredForNextPoint: task.requiredToUnlock,
        };

        if (isUpdate && task.questTaskId) {
            switch (task.type) {
                case 'quiz': {
                    const quizData = {
                        ...baseData,
                        maxScorePointsCount: parseNumber(task.maxPoints, 100),
                        successScorePointsPercent: parseNumber(task.successThreshold, 80),
                        quizQuestions: task.questions
                            .filter(q => q.text.trim() && q.options.some(opt => opt.text.trim()))
                            .map((q, index) => ({
                                question: q.text,
                                orderNumber: index + 1,
                                scorePointsCount: parseNumber(q.points, 50),
                                answers: q.options
                                    .filter(opt => opt.text.trim())
                                    .map(opt => ({
                                        answer: opt.text,
                                        isCorrect: opt.isCorrect,
                                    })),
                            })),
                    };
                    return await questsApi.updateQuizTask(task.questTaskId, quizData);
                }

                case 'photo': {
                    const photoData = {
                        ...baseData,
                        scorePointsCount: parseNumber(task.maxPoints, 100),
                    };
                    return await questsApi.updatePhotoTask(task.questTaskId, photoData);
                }

                case 'code_word': {
                    const codeWordData = {
                        ...baseData,
                        scorePointsCount: parseNumber(task.maxPoints, 100),
                        codeWord: task.codeWord || 'SECRET',
                    };
                    return await questsApi.updateCodeWordTask(task.questTaskId, codeWordData);
                }
            }
        }

        switch (task.type) {
            case 'quiz': {
                const quizData: CreateQuizTaskRequest = {
                    ...baseData,
                    maxScorePointsCount: parseNumber(task.maxPoints, 100),
                    successScorePointsPercent: parseNumber(task.successThreshold, 80),
                    quizQuestions: task.questions
                        .filter(q => q.text.trim() && q.options.some(opt => opt.text.trim()))
                        .map((q, index) => ({
                            question: q.text,
                            orderNumber: index + 1,
                            scorePointsCount: parseNumber(q.points, 50),
                            answers: q.options
                                .filter(opt => opt.text.trim())
                                .map(opt => ({
                                    answer: opt.text,
                                    isCorrect: opt.isCorrect,
                                })),
                        })),
                };

                return await questsApi.createQuizTask(checkpoint.questPointId, quizData);
            }

            case 'photo': {
                const photoData: CreatePhotoTaskRequest = {
                    ...baseData,
                    scorePointsCount: parseNumber(task.maxPoints, 100),
                };
                return await questsApi.createPhotoTask(checkpoint.questPointId, photoData);
            }

            case 'code_word': {
                const codeWordData: CreateCodeWordTaskRequest = {
                    ...baseData,
                    scorePointsCount: parseNumber(task.maxPoints, 100),
                    codeWord: task.codeWord || 'SECRET',
                };
                return await questsApi.createCodeWordTask(checkpoint.questPointId, codeWordData);
            }

            default:
                throw new Error(`Unknown task type: ${task.type}`);
        }
    };

    const addTask = (checkpointId: string): void => {
        const emptyTask = createEmptyTask();
        checkpointTasks.value.set(checkpointId, emptyTask);
        saveTasksToFormData();
    };

    const removeTask = async (checkpointId: string): Promise<void> => {
        if (!confirmWithTranslation(t, 'quests.createQuest.confirmations.deleteTask')) {
            return;
        }

        const task = checkpointTasks.value.get(checkpointId);

        if (task?.questTaskId) {
            try {
                await questsApi.deleteTask(task.questTaskId);
                showSuccess('Task deleted successfully');
            } catch (error: any) {
                showError(error?.response?.data?.message || 'Failed to delete task');
                return;
            }
        }

        checkpointTasks.value.set(checkpointId, null);
        saveTasksToFormData();
    };

    const updateTask = (checkpointId: string, updatedTask: Task): void => {
        checkpointTasks.value.set(checkpointId, updatedTask);
        saveTasksToFormData();

        emit('update:modelValue', {
            ...props.modelValue,
            checkpoints: props.modelValue.checkpoints.map(cp => ({
                id: cp.id,
                name: cp.name,
                latitude: cp.latitude,
                longitude: cp.longitude,
                questPointId: cp.questPointId,
                requiredForNext: cp.id === checkpointId ? updatedTask.requiredToUnlock : cp.requiredForNext,
            })),
        });
    };

    const saveAllTasks = async (): Promise<void> => {
        isSaving.value = true;

        try {
            const checkpoints = getCheckpoints();
            const checkpointsWithTasks = checkpoints.filter(cp => cp.task !== null);

            await Promise.all(
                checkpointsWithTasks.map(checkpoint => {
                    const isUpdate = !!checkpoint.task?.questTaskId;
                    return saveTaskToBackend(checkpoint, isUpdate);
                })
            );

            showSuccess('All tasks saved successfully');
        } catch (error: any) {
            showError(error?.response?.data?.message || error?.message || 'Failed to save tasks');
            throw error;
        } finally {
            isSaving.value = false;
        }
    };

    return {
        expandedCheckpointId,
        checkpointTasks,
        isSaving,
        isLoading,
        errorMessage,
        successMessage,
        getCheckpoints,
        toggleCheckpoint,
        addTask,
        removeTask,
        updateTask,
        saveAllTasks,
    };
};

