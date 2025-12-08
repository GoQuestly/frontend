import apiClient from './apiClient';

export interface ServerTimeResponse {
    serverTime: string;
}

export const systemApi = {
    async getServerTime(): Promise<Date> {
        const response = await apiClient.get<ServerTimeResponse>('/server-time');
        return new Date(response.data.serverTime);
    },
};
