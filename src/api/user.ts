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

export interface GuardProfile {
    guard: {
        id: string;
        employeeId: string;
        fullName: string;
        email: string | null;
        role: 'ADMIN' | 'GUARD';
        isActive: boolean;
        createdAt: string;
    };
    summary: {
        watchSeconds: number;
        totalAttempts: number;
        passedAttempts: number;
        averageScore: number;
        certificatesEarned: number;
        modulesCompleted: number;
        lastActivity: string | null;
    };
    courseProgress: {
        courseId: string;
        courseTitle: string;
        totalModules: number;
        watchedModules: number;
        passedQuizzes: number;
        completionPercent: number;
    }[];
    attempts: {
        id: string;
        score: number;
        passed: boolean;
        attemptedAt: string;
        moduleTitle: string;
        courseTitle: string;
    }[];
    certificates: {
        id: string;
        certCode: string;
        issuedAt: string;
        imageUrl: string | null;
        courseTitle: string;
    }[];
}

export const getGuardProfile = async (guardId: string): Promise<GuardProfile> => {
    const response = await api.get<GuardProfile>(`/admin/users/${guardId}/profile`);
    return response.data;
};
