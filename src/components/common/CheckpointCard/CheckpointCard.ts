import { reactive, ref, watch, computed } from 'vue';
import type { QuestCheckpoint } from '@/types/checkpoint';

export type Checkpoint = QuestCheckpoint;

export interface Props {
    checkpoint: Checkpoint;
    number: number;
    isSelected?: boolean;
    mode?: 'edit' | 'accordion' | 'view';
    expanded?: boolean;
}

export interface Emits {
    (e: 'update', checkpoint: Checkpoint): void;
    (e: 'select'): void;
    (e: 'delete'): void;
    (e: 'save', checkpoint: Checkpoint): void;
    (e: 'toggle'): void;
}

export function useCheckpointCard(props: Props, emit: Emits) {
    const localCheckpoint = reactive({ ...props.checkpoint });
    const internalExpanded = ref(false);

    const isExpanded = computed(() => {
        if (props.mode === 'accordion') {
            return props.expanded ?? false;
        }
        if (props.mode === 'view') {
            return false;
        }
        return props.isSelected || internalExpanded.value;
    });

    watch(() => props.checkpoint, (newValue) => {
        Object.assign(localCheckpoint, newValue);
    }, { deep: true });

    watch(() => props.isSelected, (newValue) => {
        if (props.mode === 'edit') {
            internalExpanded.value = newValue ?? false;
        }
    });

    const toggleExpand = (): void => {
        emit('select');
    };

    const handleClick = (): void => {
        if (props.mode === 'edit') {
            emit('select');
        } else if (props.mode === 'accordion') {
            emit('toggle');
        }
    };

    const handleSave = (): void => {
        localCheckpoint.name = (localCheckpoint.name || '').trim();
        emit('save', { ...localCheckpoint });
    };

    return {
        localCheckpoint,
        isExpanded,
        toggleExpand,
        handleClick,
        handleSave
    };
}
