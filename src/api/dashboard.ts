import api from './axios';

export interface DashboardStats {
    stats: {
        certificatesIssued: number;
        activeGuards: number;
        totalCourses: number;
        completionRate: string;
        certificateTrend?: { date: string; count: number }[];
    };
    recentActivity: {
        id: string;
        userName: string;
        courseTitle: string;
        score: number;
        passed: boolean;
        attemptedAt: string;
    }[];
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/admin/dashboard/stats');
    return response.data;
};

export interface GuardDashboardStats {
    stats: {
        certificatesIssued: number;
        totalCourses: number;
        passedQuizzes: number;
        overallCompletionPercentage: number;
        videoCompletionPercentage: number;
        quizCompletionPercentage: number;
        totalAttempts: number;
        averageQuizScore: number;
        highestQuizScore: number;
        organisationRank: number;
        totalPoints: number;
        totalProficiency: number;
        activeLearnings: number;
    };
    recentActivity: {
        id: string;
        userName: string;
        courseTitle: string;
        moduleTitle: string;
        score: number;
        passed: boolean;
        attemptedAt: string;
    }[];
    continueCourse: {
        id: string;
        title: string;
        thumbnail: string | null;
        progress: number;
        hasCertificate?: boolean;
    } | null;
}

export const getGuardDashboardStats = async (): Promise<GuardDashboardStats> => {
    const response = await api.get<GuardDashboardStats>('/admin/dashboard/guard/stats');
    return response.data;
};

export const generateCertificate = async (courseId: string): Promise<{ message: string; certificateId?: string }> => {
    const response = await api.post('/progress/generate-certificate', { courseId });
    return response.data;
};

// ✅ NEW: Delete old cert + generate fresh one
export const regenerateMyCertificate = async (courseId: string): Promise<any> => {
    const response = await api.post('/certificates/regenerate', { courseId });
    return response.data;
};

export const getMyCertificates = async (): Promise<any[]> => {
    const response = await api.get('/certificates/my');
    return response.data;
};

export const getAllCertificates = async (): Promise<any[]> => {
    const response = await api.get('/certificates/all');
    return response.data;
};