import { reactive, ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Sortable from 'sortablejs';
import type { Options } from 'sortablejs';
import { questsApi } from '@/api/questsApi';
import type { QuestFormData } from '@/types/form';
import { showTemporaryMessage } from '@/utils/messages';
import { confirmWithTranslation } from '@/utils/dialogs';
import type { QuestCheckpoint } from '@/types/checkpoint';

export type Checkpoint = QuestCheckpoint;

interface Props {
    modelValue: QuestFormData;
    questId: number | null;
}

interface Emit {
    (e: 'update:modelValue', value: QuestFormData): void;
}

export const useCheckpointsSetup = (props: Props, emit: Emit) => {
    const { t } = useI18n();

    const localData = reactive({
        checkpoints: [] as Checkpoint[],
    });

    const selectedCheckpointId = ref<string | null>(null);
    const checkpointsListRef = ref<HTMLElement | null>(null);
    const isCreating = ref(false);
    const isLoading = ref(false);
    const errorKey = ref('');
    let sortableInstance: Sortable | null = null;

    const error = computed(() => errorKey.value ? t(errorKey.value) : '');
    const successMessage = ref('');

    const updateParent = (): void => {
        emit('update:modelValue', {
            ...props.modelValue,
            checkpoints: [...localData.checkpoints],
        });
    };

    const loadCheckpoints = async (): Promise<void> => {
        if (!props.questId) {
            localData.checkpoints = [];
            return;
        }

        isLoading.value = true;
        errorKey.value = '';

        try {
            const data = await questsApi.getCheckpoints(props.questId);

            localData.checkpoints = data.map((cp) => ({
                id: String(cp.questPointId),
                name: cp.name,
                latitude: cp.latitude,
                longitude: cp.longitude,
                requiredForNext: false,
                questPointId: cp.questPointId,
            }));

            updateParent();
        } catch (err: any) {
            if (err.response?.status === 401) {
                errorKey.value = 'quests.createQuest.errors.sessionExpired';
            } else if (err.response?.status === 500) {
                localData.checkpoints = [];
            } else {
                errorKey.value = 'quests.createQuest.step2.errors.checkpointCreateFailed';
            }
        } finally {
            isLoading.value = false;
        }
    };

    const updateCheckpointsOrder = async (): Promise<void> => {
        if (!props.questId) return;

        try {
            for (let i = 0; i < localData.checkpoints.length; i++) {
                const checkpoint = localData.checkpoints[i];

                if (!checkpoint.questPointId) {
                    continue;
                }

                await questsApi.updateCheckpoint(checkpoint.questPointId, {
                    name: checkpoint.name,
                    latitude: checkpoint.latitude,
                    longitude: checkpoint.longitude,
                    orderNum: i + 1,
                });
            }
        } catch {
            errorKey.value = 'quests.createQuest.step2.errors.checkpointUpdateFailed';
        }
    };

    const handleDragStart = (): void => {
        selectedCheckpointId.value = null;
    };

    const handleDragEnd = async (evt: Sortable.SortableEvent): Promise<void> => {
        const { oldIndex, newIndex } = evt;

        if (oldIndex !== undefined && newIndex !== undefined && oldIndex !== newIndex) {
            const newCheckpoints = [...localData.checkpoints];
            const [movedItem] = newCheckpoints.splice(oldIndex, 1);
            newCheckpoints.splice(newIndex, 0, movedItem);

            localData.checkpoints = newCheckpoints;
            updateParent();

            const allCheckpointsHaveIds = localData.checkpoints.every(cp => cp.questPointId);

            if (allCheckpointsHaveIds) {
                await updateCheckpointsOrder();
            }
        }
    };

    onMounted(async () => {
        await loadCheckpoints();

        await nextTick();

        if (checkpointsListRef.value) {
            const sortableOptions: Options = {
                animation: 200,
                handle: '.drag-icon',
                ghostClass: 'ghost-checkpoint',
                dragClass: 'drag-checkpoint',
                chosenClass: 'chosen-checkpoint',
                forceFallback: false,
                onStart: handleDragStart,
                onEnd: handleDragEnd,
            };

            sortableInstance = new Sortable(checkpointsListRef.value, sortableOptions);
        }
    });

    onBeforeUnmount(() => {
        if (sortableInstance) {
            sortableInstance.destroy();
            sortableInstance = null;
        }
    });

    const selectCheckpoint = (id: string): void => {
        if (selectedCheckpointId.value === id) {
            selectedCheckpointId.value = null;
        } else {
            selectedCheckpointId.value = id;
        }
    };

    const updateCheckpoint = async (updatedCheckpoint: Checkpoint): Promise<void> => {
        errorKey.value = '';

        const normalizedCheckpoint: Checkpoint = {
            ...updatedCheckpoint,
            name: (updatedCheckpoint.name || '').trim(),
        };

        const index = localData.checkpoints.findIndex(cp => cp.id === normalizedCheckpoint.id);
        if (index === -1) return;

        localData.checkpoints[index] = normalizedCheckpoint;
        updateParent();

        if (!normalizedCheckpoint.questPointId) {
            return;
        }

        try {
            await questsApi.updateCheckpoint(normalizedCheckpoint.questPointId, {
                name: normalizedCheckpoint.name,
                latitude: normalizedCheckpoint.latitude,
                longitude: normalizedCheckpoint.longitude,
                orderNum: index + 1,
            });

            showTemporaryMessage(successMessage, t('quests.createQuest.step2.checkpointSaveSuccess'), 3000);
        } catch (err: any) {

            if (err.response?.status === 401) {
                errorKey.value = 'quests.createQuest.errors.sessionExpired';
            } else {
                errorKey.value = 'quests.createQuest.step2.errors.checkpointUpdateFailed';
            }
        }
    };

    const updateCheckpointCoordinates = (id: string, lat: number, lng: number): void => {
        const index = localData.checkpoints.findIndex(cp => cp.id === id);
        if (index !== -1) {
            localData.checkpoints[index].latitude = lat;
            localData.checkpoints[index].longitude = lng;
        }
    };

    const deleteCheckpoint = async (id: string): Promise<void> => {
        errorKey.value = '';

        const checkpoint = localData.checkpoints.find(cp => cp.id === id);

        if (!checkpoint) return;

        if (!confirmWithTranslation(t, 'quests.createQuest.confirmations.deleteCheckpoint')) {
            return;
        }

        if (checkpoint.questPointId) {
            try {
                await questsApi.deleteCheckpoint(checkpoint.questPointId);
            } catch (err: any) {
                if (err.response?.status === 401) {
                    errorKey.value = 'quests.createQuest.errors.sessionExpired';
                } else {
                    errorKey.value = 'quests.createQuest.step2.errors.checkpointDeleteFailed';
                }
                return;
            }
        }

        localData.checkpoints = localData.checkpoints.filter(cp => cp.id !== id);
        if (selectedCheckpointId.value === id) {
            selectedCheckpointId.value = null;
        }
        updateParent();
    };

    const addNewCheckpoint = async (): Promise<void> => {
        errorKey.value = '';

        if (!props.questId) {
            errorKey.value = 'quests.createQuest.errors.questNotCreated';
            return;
        }

        isCreating.value = true;

        try {
            const checkpointNumber = localData.checkpoints.length + 1;
            const defaultName = `Checkpoint ${checkpointNumber}`;

            const defaultLat = props.modelValue.startingLat || 40.7128;
            const defaultLng = props.modelValue.startingLng || -74.0060;

            const data = await questsApi.createCheckpoint(props.questId, {
                name: defaultName,
                latitude: defaultLat,
                longitude: defaultLng,
                orderNum: checkpointNumber,
            });

            const newCheckpoint: Checkpoint = {
                id: String(data.questPointId),
                name: data.name,
                latitude: data.latitude,
                longitude: data.longitude,
                requiredForNext: false,
                questPointId: data.questPointId,
            };

            localData.checkpoints = [...localData.checkpoints, newCheckpoint];

            await nextTick();

            selectedCheckpointId.value = newCheckpoint.id;
            updateParent();
        } catch (err: any) {
            if (err.response?.status === 401) {
                errorKey.value = 'quests.createQuest.errors.sessionExpired';
            } else if (err.response?.status === 500) {
                errorKey.value = 'quests.createQuest.step2.errors.checkpointCreateFailed';
            } else {
                errorKey.value = 'quests.createQuest.step2.errors.checkpointCreateFailed';
            }
        } finally {
            isCreating.value = false;
        }
    };

    const getCheckpoints = (): Checkpoint[] => {
        return localData.checkpoints;
    };

    return {
        localData,
        selectedCheckpointId,
        checkpointsListRef,
        isCreating,
        isLoading,
        error,
        successMessage,
        selectCheckpoint,
        updateCheckpoint,
        updateCheckpointCoordinates,
        deleteCheckpoint,
        addNewCheckpoint,
        getCheckpoints,
    };
};
