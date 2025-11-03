import { apiClient } from './apiClient';

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

export const questsApi = {
    async getQuests(params: GetQuestsParams = {}): Promise<QuestsListResponse> {
        const { search = '', pageNumber = 1, pageSize = 10 } = params;

        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        queryParams.append('pageNumber', pageNumber.toString());
        queryParams.append('pageSize', pageSize.toString());

        const response = await apiClient.get<QuestsListResponse>(
            `/organizer/quests?${queryParams.toString()}`
        );

        return response.data;
    },
};