import api from './api';

export const transferService = {
    getTransfers: async (params) => {
        const response = await api.get('/transfers', { params });
        return response.data;
    },
    
    getTransferById: async (id) => {
        const response = await api.get(`/transfers/${id}`);
        return response.data;
    },
    
    createTransfer: async (data) => {
        const response = await api.post('/transfers', data);
        return response.data;
    },
    
    completeTransfer: async (id) => {
        const response = await api.put(`/transfers/${id}/complete`);
        return response.data;
    },
    
    cancelTransfer: async (id) => {
        const response = await api.put(`/transfers/${id}/cancel`);
        return response.data;
    }
};
