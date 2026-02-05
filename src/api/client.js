const API_BASE = 'http://localhost:3001/api';

// Generic fetch wrapper with error handling
async function fetchAPI(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Projects API
export const projectsAPI = {
    getAll: () => fetchAPI('/projects'),
    getOne: (id) => fetchAPI(`/projects/${id}`),
    create: (data) => fetchAPI('/projects', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => fetchAPI(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => fetchAPI(`/projects/${id}`, { method: 'DELETE' }),
};

// Comments API
export const commentsAPI = {
    getAll: (projectId, search = '') => {
        const params = new URLSearchParams();
        if (projectId) params.append('project_id', projectId);
        if (search) params.append('search', search);
        return fetchAPI(`/comments?${params.toString()}`);
    },
    getOne: (id) => fetchAPI(`/comments/${id}`),
    create: (data) => fetchAPI('/comments', { method: 'POST', body: JSON.stringify(data) }),
    createBulk: (comments) => fetchAPI('/comments/bulk', { method: 'POST', body: JSON.stringify({ comments }) }),
    update: (id, data) => fetchAPI(`/comments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => fetchAPI(`/comments/${id}`, { method: 'DELETE' }),
    export: (projectId) => fetchAPI(`/comments/export/${projectId}`),
};

// Staff API
export const staffAPI = {
    getAll: () => fetchAPI('/staff'),
    getOne: (id) => fetchAPI(`/staff/${id}`),
    create: (data) => fetchAPI('/staff', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => fetchAPI(`/staff/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => fetchAPI(`/staff/${id}`, { method: 'DELETE' }),
};

// Prompts API
export const promptsAPI = {
    getAll: (projectId) => {
        const params = projectId ? `?project_id=${projectId}` : '';
        return fetchAPI(`/prompts${params}`);
    },
    getOne: (id) => fetchAPI(`/prompts/${id}`),
    create: (data) => fetchAPI('/prompts', { method: 'POST', body: JSON.stringify(data) }),
    update: (id, data) => fetchAPI(`/prompts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    delete: (id) => fetchAPI(`/prompts/${id}`, { method: 'DELETE' }),
};

// Health check
export const healthCheck = () => fetchAPI('/health');
