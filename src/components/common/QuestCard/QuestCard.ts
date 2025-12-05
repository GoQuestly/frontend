import { formatDuration, formatCheckpoints } from '@/utils/format';

export interface QuestCardProps {
    quest: {
        id: number;
        title: string;
        subtitle: string;
        description: string;
        imageUrl?: string;
        checkpointsCount: number;
        estimatedDuration: number;
        lastSessionDate?: string;
        nextSessionDate?: string;
    };
}

export interface QuestCardEmits {
    (e: 'click', questId: number): void;
}

export const formatDurationForCard = formatDuration;
export const formatCheckpointsForCard = formatCheckpoints;
