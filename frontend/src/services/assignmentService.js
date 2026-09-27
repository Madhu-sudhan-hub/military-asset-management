import api from './api';

export const assignmentService = {
    getAssignments: async (params) => {
        const response = await api.get('/assignments', { params });
        return response.data;
    },
    
    getAssignmentById: async (id) => {
        const response = await api.get(`/assignments/${id}`);
        return response.data;
    },
    
    createAssignment: async (data) => {
        const response = await api.post('/assignments', data);
        return response.data;
    },
    
    returnAssignment: async (id) => {
        const response = await api.put(`/assignments/${id}/return`);
        return response.data;
    },
    
    cancelAssignment: async (id) => {
        const response = await api.put(`/assignments/${id}/cancel`);
        return response.data;
    }
};
