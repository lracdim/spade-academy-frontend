import api from './axios';

export const updateVideoProgress = async (
    moduleId: string,
    lastPosition: number = 0,
    duration: number = 0,
    isCompleted: boolean = false
): Promise<any> => {
    console.log(`[API] Video Progress: mod=${moduleId}, pos=${lastPosition}, dur=${duration}, comp=${isCompleted}`);
    const response = await api.post('/progress/video-watched', {
        moduleId,
        lastPosition: Math.floor(lastPosition),
        duration: Math.floor(duration),
        isCompleted
    });
    return response.data;
};

export const getMyProgress = async (): Promise<any> => {
    const response = await api.get('/progress/my-progress');
    return response.data;
};