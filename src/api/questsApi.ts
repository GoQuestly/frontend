import { apiClient } from './apiClient';
import type {
    QuestsListResponse,
    GetQuestsParams,
    CreateQuestRequest,
    CreateQuestResponse,
    UpdateQuestRequest,
} from '@/types/quests';

import type {
    CheckpointResponse,
    CreateCheckpointRequest,
    CreateCheckpointResponse,
    UpdateCheckpointRequest,
} from '@/types/checkpoint';

import type {
    CreateQuizTaskRequest,
    CreatePhotoTaskRequest,
    CreateCodeWordTaskRequest,
    UpdateQuizTaskRequest,
    UpdatePhotoTaskRequest,
    UpdateCodeWordTaskRequest,
    TaskResponse,
} from '@/types/task';

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
    async getQuestById(questId: number) {
        const response = await apiClient.get(`/organizer/quest/${questId}`);
        return response.data;
    },
    async createQuest(data: CreateQuestRequest): Promise<CreateQuestResponse> {
        const response = await apiClient.post<CreateQuestResponse>(
            '/organizer/quest',
            data
        );

        return response.data;
    },

    async updateQuest(questId: number, data: UpdateQuestRequest): Promise<void> {
        await apiClient.patch(
            `/organizer/quest/${questId}`,
            data
        );
    },
    async uploadCoverImage(questId: number, file: File): Promise<void> {
        const formData = new FormData();
        formData.append('file', file);

        await apiClient.post(
            `/organizer/quest/${questId}/cover-image`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
    },

    async getCheckpoints(questId: number): Promise<CheckpointResponse[]> {
        const response = await apiClient.get<CheckpointResponse[]>(
            `/organizer/quest/${questId}/points`
        );

        return response.data;
    },

    async createCheckpoint(
        questId: number,
        data: CreateCheckpointRequest
    ): Promise<CreateCheckpointResponse> {
        const response = await apiClient.post<CreateCheckpointResponse>(
            `/organizer/quest/${questId}/points`,
            data
        );

        return response.data;
    },

    async updateCheckpoint(
        pointId: number,
        data: UpdateCheckpointRequest
    ): Promise<void> {
        await apiClient.patch(
            `/organizer/quest/points/${pointId}`,
            data
        );
    },

    async deleteCheckpoint(pointId: number): Promise<void> {
        await apiClient.delete(
            `/organizer/quest/points/${pointId}`
        );
    },

    async createQuizTask(
        questPointId: number,
        data: CreateQuizTaskRequest
    ): Promise<TaskResponse> {
        const response = await apiClient.post<TaskResponse>(
            `/organizer/quest-tasks/quiz/${questPointId}`,
            data
        );

        return response.data;
    },

    async createPhotoTask(
        questPointId: number,
        data: CreatePhotoTaskRequest
    ): Promise<TaskResponse> {
        const response = await apiClient.post<TaskResponse>(
            `/organizer/quest-tasks/photo/${questPointId}`,
            data
        );

        return response.data;
    },

    async createCodeWordTask(
        questPointId: number,
        data: CreateCodeWordTaskRequest
    ): Promise<TaskResponse> {
        const response = await apiClient.post<TaskResponse>(
            `/organizer/quest-tasks/code-word/${questPointId}`,
            data
        );

        return response.data;
    },

    async updateQuizTask(
        taskId: number,
        data: UpdateQuizTaskRequest
    ): Promise<TaskResponse> {
        const response = await apiClient.put<TaskResponse>(
            `/organizer/quest-tasks/quiz/${taskId}`,
            data
        );

        return response.data;
    },

    async updatePhotoTask(
        taskId: number,
        data: UpdatePhotoTaskRequest
    ): Promise<TaskResponse> {
        const response = await apiClient.put<TaskResponse>(
            `/organizer/quest-tasks/photo/${taskId}`,
            data
        );

        return response.data;
    },

    async updateCodeWordTask(
        taskId: number,
        data: UpdateCodeWordTaskRequest
    ): Promise<TaskResponse> {
        const response = await apiClient.put<TaskResponse>(
            `/organizer/quest-tasks/code-word/${taskId}`,
            data
        );

        return response.data;
    },

    async deleteTask(questTaskId: number): Promise<void> {
        await apiClient.delete(
            `/organizer/quest-tasks/${questTaskId}`
        );
    },
};