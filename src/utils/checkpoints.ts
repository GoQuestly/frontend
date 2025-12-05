import type {QuestCheckpoint} from '@/types/checkpoint';

export const createStartingPointCheckpoint = (
    latitude: number,
    longitude: number,
    name: string = 'Starting Point'
): QuestCheckpoint => ({
    id: 'starting-point',
    name,
    latitude,
    longitude,
});
