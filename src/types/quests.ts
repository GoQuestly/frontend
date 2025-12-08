export interface Quest {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    imageUrl?: string;
    checkpointsCount: number;
    estimatedDuration: number;
    lastSessionDate?: string;
    nextSessionDate?: string;
    isDraft?: boolean;
}

export interface MyQuestsState {
    quests: Quest[];
    searchQuery: string;
    currentPage: number;
    totalPages: number;
    pageSize: number;
    isLoading: boolean;
    error: string | null;
}

export interface QuestResponse {
    questId: number;
    title: string;
    description: string;
    creationDate: string;
    updateDate: string;
    startingLatitude: number;
    startingLongitude: number;
    startingRadiusMeters: number;
    maxDurationMinutes: number;
    photoUrl: string | null;
    minParticipantCount: number;
    maxParticipantCount: number;
    organizerId: number;
    questPointCount?: number;
    lastSessionDate?: string;
    nextSessionDate?: string;
}

export interface CreateQuestRequest {
    title: string;
    description: string;
    startingLatitude: number;
    startingLongitude: number;
    startingRadiusMeters: number;
    minParticipantCount: number;
    maxParticipantCount: number;
    maxDurationMinutes: number;
}

export interface CreateQuestResponse {
    questId: number;
}

export interface UpdateQuestRequest {
    title: string;
    description: string;
    startingLatitude: number;
    startingLongitude: number;
    startingRadiusMeters: number;
    minParticipantCount: number;
    maxParticipantCount: number;
    maxDurationMinutes: number;
}
export interface QuestsListResponse {
    items: QuestResponse[];
    total: number;
    pageNumber: number;
    pageSize: number;
}

export interface GetQuestsParams {
    search?: string;
    pageNumber?: number;
    pageSize?: number;
}

