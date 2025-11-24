import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { questsApi } from '@/api/questsApi';
import type { QuestFormData } from '@/types/form';
import type {Task, TaskResponse} from '@/types/task';
import { mapBackendTaskToLocal } from '@/utils/taskMapping';
import { createStartingPointCheckpoint } from '@/utils/checkpoints';
import { formatDuration as formatDurationUtil } from '@/utils/format';

interface Props {
    modelValue: QuestFormData;
    questId: number | null;
    coverImagePreview?: string;
}

export const useReviewStep = (props: Props) => {
    const { t } = useI18n();

    const formData = computed(() => props.modelValue);
    const isLoadingTasks = ref(false);
    const loadedTasks = ref<Map<string, Task | null>>(new Map());

    const startingPointCheckpoint = computed(() =>
        createStartingPointCheckpoint(formData.value.startingLat, formData.value.startingLng),
    );

    const loadTasks = async (): Promise<void> => {
        if (!props.questId) {
            return;
        }

        isLoadingTasks.value = true;

        try {
            const points = await questsApi.getCheckpoints(props.questId);

            loadedTasks.value.clear();

            formData.value.checkpoints.forEach((checkpoint) => {
                const point = points.find((p: any) => p.questPointId === checkpoint.questPointId);

                if (!point || !point.task || !point.task.questTaskId) {
                    loadedTasks.value.set(checkpoint.id, null);
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
                loadedTasks.value.set(checkpoint.id, task);
            });

        } catch (error: any) {
        } finally {
            isLoadingTasks.value = false;
        }
    };

    const getTaskForCheckpoint = (checkpointId: string): Task | null => {
        return loadedTasks.value.get(checkpointId) || null;
    };

    const formatDuration = (minutes: number): string => {
        return formatDurationUtil(minutes, t);
    };

    const getTaskTypeLabel = (type: string): string => {
        const labels: Record<string, string> = {
            quiz: t('quests.createQuest.step3.quiz'),
            photo: t('quests.createQuest.step3.photo'),
            code_word: t('quests.createQuest.step3.codeWord'),
        };
        return labels[type] || type;
    };

    onMounted(() => {
        loadTasks();
    });

    return {
        formData,
        isLoadingTasks,
        startingPointCheckpoint,
        getTaskForCheckpoint,
        formatDuration,
        getTaskTypeLabel,
    };
};
