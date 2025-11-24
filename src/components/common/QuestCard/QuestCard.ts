import { formatDuration } from '@/utils/format';

export interface QuestCardProps {
    quest: {
        id: string;
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
    (e: 'click', questId: string): void;
}

export const formatDurationForCard = formatDuration;