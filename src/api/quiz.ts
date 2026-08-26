import api from './axios';

export interface QuizAttempt {
    id: string;
    quizId: string;
    score: number;
    passed: boolean;
    attemptedAt: string;
    moduleTitle: string;
    courseTitle: string;
}

export const getMyQuizAttempts = async (): Promise<QuizAttempt[]> => {
    const response = await api.get<QuizAttempt[]>('/quizzes/attempts');
    return response.data;
};

export const getQuizAttemptDetails = async (attemptId: string): Promise<any> => {
    const response = await api.get(`/quizzes/attempts/${attemptId}`);
    return response.data;
};
