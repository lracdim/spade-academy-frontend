import api from './axios';

export interface User {
    id: string;
    employeeId: string;
    fullName: string;
    email: string | null;
    password?: string;
    role: 'ADMIN' | 'GUARD';
    isActive: boolean;
    createdAt: string;
    progress?: string;
    score?: string;
    attempts?: number;
}

export const getUsers = async (role?: 'ADMIN' | 'GUARD'): Promise<User[]> => {
    const response = await api.get<User[]>('/admin/users', {
        params: { role }
    });
    return response.data;
};

export const createUser = async (data: Partial<User> & { password?: string }): Promise<User> => {
    const response = await api.post<User>('/admin/users', data);
    return response.data;
};

export const updateUser = async (id: string, data: Partial<User> & { password?: string }): Promise<User> => {
    const response = await api.patch<User>(`/admin/users/${id}`, data);
    return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
    await api.delete(`/admin/users/${id}`);
};
