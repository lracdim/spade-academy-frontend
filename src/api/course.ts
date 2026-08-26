import api from './axios';

export interface Course {
    id: string;
    title: string;
    description: string;
    thumbnail: string | null;
    certificateTemplate: string | null;
    isPublished: boolean;
    order: number;
    createdAt: string;
    moduleCount: number;
    lessonCount: number;
}

export const getCourses = async (): Promise<Course[]> => {
    const response = await api.get<Course[]>('/admin/courses');
    return response.data;
};

export const createCourse = async (data: { title: string; description: string; isPublished: boolean; thumbnail?: string; certificateTemplate?: string }): Promise<Course> => {
    const response = await api.post<Course>('/admin/courses', data);
    return response.data;
};

export const updateCourse = async (id: string, data: Partial<{ title: string; description: string; isPublished: boolean; thumbnail?: string | null; certificateTemplate?: string | null }>): Promise<Course> => {
    const response = await api.patch<Course>(`/admin/courses/${id}`, data);
    return response.data;
};

export const deleteCourse = async (id: string): Promise<void> => {
    await api.delete(`/admin/courses/${id}`);
};
