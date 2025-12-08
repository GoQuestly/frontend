import { apiClient } from './apiClient';
import type {
    QuestSessionDetail,
    ParticipantLocation,
    CreateQuestSessionRequest,
    QuestSessionResponse,
    QuestSessionsResponse,
    SessionScoresResponse,
    PendingPhotoForModeration,
    ModeratePhotoRequest,
    ModeratePhotoResponse
} from '@/types/session';

export const sessionApi = {
    async getSession(sessionId: number): Promise<QuestSessionDetail> {
        const response = await apiClient.get<QuestSessionDetail>(`/organizer/sessions/${sessionId}`);
        return response.data;
    },

    async getQuestSessions(
        questId: number,
        pageNumber: number = 1,
        pageSize: number = 10
    ): Promise<QuestSessionsResponse> {
        const params = new URLSearchParams({
            pageNumber: pageNumber.toString(),
            pageSize: pageSize.toString(),
        });

        const response = await apiClient.get<QuestSessionsResponse>(
            `/organizer/quest/${questId}/sessions?${params.toString()}`
        );

        return response.data;
    },

    async createQuestSession(
        questId: number,
        data: CreateQuestSessionRequest,
    ): Promise<QuestSessionResponse> {
        const response = await apiClient.post<QuestSessionResponse>(
            `/organizer/quest/${questId}/sessions`,
            data,
        );

        return response.data;
    },

    async updateSession(sessionId: number, data: { startDate: string }): Promise<QuestSessionResponse> {
        const response = await apiClient.put<QuestSessionResponse>(
            `/organizer/sessions/${sessionId}`,
            data
        );
        return response.data;
    },

    async cancelSession(sessionId: number): Promise<QuestSessionDetail> {
        const response = await apiClient.post<QuestSessionDetail>(`/organizer/sessions/${sessionId}/cancel`);
        return response.data;
    },

    async getLatestLocations(sessionId: number): Promise<ParticipantLocation[]> {
        const response = await apiClient.get<ParticipantLocation[]>(`/organizer/sessions/${sessionId}/locations/latest`);
        return response.data;
    },

    async getSessionScores(sessionId: number): Promise<SessionScoresResponse> {
        const response = await apiClient.get<SessionScoresResponse>(`/organizer/sessions/${sessionId}/scores`);
        return response.data;
    },

    async getPendingPhotos(sessionId: number): Promise<PendingPhotoForModeration[]> {
        const response = await apiClient.get<PendingPhotoForModeration[]>(
            `/organizer/sessions/${sessionId}/photos/pending`
        );
        return response.data;
    },

    async moderatePhoto(
        sessionId: number,
        photoId: number,
        data: ModeratePhotoRequest
    ): Promise<ModeratePhotoResponse> {
        const response = await apiClient.post<ModeratePhotoResponse>(
            `/organizer/sessions/${sessionId}/photos/${photoId}/moderate`,
            data
        );
        return response.data;
    },
};
