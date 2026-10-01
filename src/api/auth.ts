import api from './axios';

export const authApi = {
    login: async (credentials: any) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },
    getMe: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },
    changePassword: async (currentPassword: string, newPassword: string) => {
        const response = await api.post('/auth/change-password', { currentPassword, newPassword });
        return response.data;
    },
    logout: () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    },
};
