import api from './api';

export const expenditureService = {
    getExpenditures: async (params) => {
        const response = await api.get('/expenditures', { params });
        return response.data;
    },
    
    getExpenditureById: async (id) => {
        const response = await api.get(`/expenditures/${id}`);
        return response.data;
    },
    
    createExpenditure: async (data) => {
        const response = await api.post('/expenditures', data);
        return response.data;
    }
};
