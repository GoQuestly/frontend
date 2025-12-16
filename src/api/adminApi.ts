import { apiClient } from './apiClient';

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminLoginResponse {
  access_token: string;
  email: string;
  adminId: number;
}

export interface AdminUser {
  userId: number;
  name: string;
  email: string;
  photoUrl: string | null;
  isEmailVerified: boolean;
  isBanned: boolean;
  questCount: number;
  sessionCount: number;
}

export interface AdminUsersResponse {
  items: AdminUser[];
  total: number;
  pageNumber: number;
  pageSize: number;
}

export interface GetUsersParams {
  pageNumber?: number;
  pageSize?: number;
  search?: string;
  sortBy?: 'registration' | 'email' | 'name';
  sortOrder?: 'ASC' | 'DESC';
}

export interface PlatformStatistics {
  period: {
    type: string;
    startDate: string;
    endDate: string;
  };
  metrics: {
    totalUsers: number;
    newUsers: number;
    activeUsers: number;
    totalQuests: number;
    totalSessions: number;
    completedSessions: number;
    completionRate: number;
    activeSessions: number;
    userGrowth: number;
  };
}

export const adminApi = {

  login: async (credentials: AdminLoginRequest): Promise<AdminLoginResponse> => {
    const response = await apiClient.post<AdminLoginResponse>('/admin/login', credentials);
    return response.data;
  },

  getUsers: async (params: GetUsersParams = {}): Promise<AdminUsersResponse> => {
    const response = await apiClient.get<AdminUsersResponse>('/admin/users', {
      params: {
        pageNumber: params.pageNumber || 1,
        pageSize: params.pageSize || 10,
        search: params.search || undefined,
        sortBy: params.sortBy || undefined,
        sortOrder: params.sortOrder || undefined,
      },
    });
    return response.data;
  },

  banUser: async (userId: number): Promise<void> => {
    await apiClient.patch('/admin/users/ban', { userId });
  },

  unbanUser: async (userId: number): Promise<void> => {
    await apiClient.patch('/admin/users/unban', { userId });
  },

  getStatistics: async (period: 'day' | 'week' | 'month' | 'all-time' = 'month'): Promise<PlatformStatistics> => {
    const response = await apiClient.get<PlatformStatistics>('/admin/statistics', {
      params: { period },
    });
    return response.data;
  },
};
