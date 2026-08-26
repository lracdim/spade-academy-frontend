import api from './axios';

export interface Module {
    id: string;
    courseId: string;
    title: string;
    description: string | null;
    video: string | null;
    order: number;
    lessonCount: number;
    videoWatched?: boolean;
    quizPassed?: boolean;
}

export interface Lesson {
    id: string;
    moduleId: string;
    title: string;
    content: string;
    video: string | null;
    order: number;
    completed?: boolean;
}

export const getLessonsByModule = async (moduleId: string): Promise<Lesson[]> => {
    const response = await api.get<Lesson[]>(`/admin/modules/${moduleId}/lessons`);
    return response.data;
};

export const createLesson = async (moduleId: string, data: Pick<Lesson, 'title' | 'content'> & { video?: string }): Promise<Lesson> => {
    const response = await api.post<Lesson>(`/admin/modules/${moduleId}/lessons`, data);
    return response.data;
};

export const updateLesson = async (moduleId: string, lessonId: string, data: Partial<Pick<Lesson, 'title' | 'content' | 'video'>>): Promise<Lesson> => {
    const response = await api.put<Lesson>(`/admin/modules/${moduleId}/lessons/${lessonId}`, data);
    return response.data;
};

export const deleteLesson = async (moduleId: string, lessonId: string): Promise<void> => {
    await api.delete(`/admin/modules/${moduleId}/lessons/${lessonId}`);
};

export const completeLesson = async (lessonId: string): Promise<void> => {
    await api.post(`/admin/modules/lessons/${lessonId}/complete`);
};

export const getModulesByCourse = async (courseId: string): Promise<Module[]> => {
    const response = await api.get<Module[]>(`/admin/courses/${courseId}/modules`);
    return response.data;
};

export interface QuestionOptionPayload {
    text: string;
    isCorrect: boolean;
}

export interface QuestionPayload {
    text: string;
    type: 'MULTIPLE_CHOICE' | 'TRUE_OR_FALSE';
    options: QuestionOptionPayload[];
    answerText?: string;
}

export const createModule = async (
    courseId: string,
    data: {
        title: string;
        description?: string;
        video?: string;
        questions?: QuestionPayload[];
    }
): Promise<Module> => {
    const response = await api.post<Module>(`/admin/courses/${courseId}/modules`, data);
    return response.data;
};

export const updateModule = async (moduleId: string, data: { title?: string; description?: string; video?: string }): Promise<Module> => {
    const response = await api.put<Module>(`/admin/modules/${moduleId}`, data);
    return response.data;
};

export const deleteModule = async (id: string): Promise<void> => {
    await api.delete(`/admin/modules/${id}`);
};

export interface Question {
    id: string;
    quizId: string;
    text: string;
    type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER';
    options: any;
    answerText: string | null;
    createdAt: string;
}

export interface Quiz {
    id: string;
    moduleId: string;
    passMark: number;
    createdAt: string;
    questions?: Question[];
}

export const getModuleQuiz = async (moduleId: string): Promise<Quiz> => {
    const response = await api.get(`/admin/courses/0/modules/${moduleId}/quiz`);
    return response.data;
};

export const submitModuleQuiz = async (moduleId: string, data: { score: number, passed: boolean, answers: Record<string, any> }): Promise<any> => {
    const response = await api.post(`/admin/courses/0/modules/${moduleId}/quiz/submit`, data);
    return response.data;
};
export const updateModuleQuiz = async (moduleId: string, data: { questions: QuestionPayload[] }): Promise<any> => {
    const response = await api.put(`/admin/modules/${moduleId}/quiz`, data);
    return response.data;
};
