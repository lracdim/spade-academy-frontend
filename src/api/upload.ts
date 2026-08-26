export const uploadFile = async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('accessToken');
    const baseUrl = window.location.hostname === '127.0.0.1'
        ? 'http://127.0.0.1:5000/api'
        : import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

    const response = await fetch(`${baseUrl}/upload`, {
        method: 'POST',
        headers: {
            // Do NOT set Content-Type header manually here; 
            // the browser will automatically add it with the correct boundary parameter.
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Upload failed with status ${response.status}`);
    }

    return response.json();
};
