import api from './api';

export const dashboardService = {
    getDashboardSummary: async (params) => {
        const response = await api.get('/dashboard/summary', { params });
        return response.data;
    },
    
    getInventoryMovement: async (params) => {
        const response = await api.get('/dashboard/movement', { params });
        return response.data;
    }
};
