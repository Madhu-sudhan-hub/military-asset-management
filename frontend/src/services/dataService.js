import api from './api';

export const purchaseService = {
    getAllPurchases: async (params) => {
        const response = await api.get('/purchases', { params });
        return response.data;
    },
    
    getPurchaseById: async (id) => {
        const response = await api.get(`/purchases/${id}`);
        return response.data;
    },
    
    createPurchase: async (data) => {
        const response = await api.post('/purchases', data);
        return response.data;
    },
    
    updatePurchase: async (id, data) => {
        const response = await api.put(`/purchases/${id}`, data);
        return response.data;
    },
    
    deletePurchase: async (id) => {
        await api.delete(`/purchases/${id}`);
    }
};

export const baseService = {
    getAllBases: async () => {
        const response = await api.get('/bases?size=1000'); // get all for dropdown
        return response.data;
    }
};

export const equipmentTypeService = {
    getAllEquipmentTypes: async () => {
        const response = await api.get('/equipment-types?size=1000'); // get all for dropdown
        return response.data;
    }
};

export const assetService = {
    getAssetsByBaseAndEquipment: async (baseId, equipmentTypeId) => {
        const response = await api.get(`/assets?size=1000&baseId=${baseId}&equipmentTypeId=${equipmentTypeId}`);
        return response.data;
    }
};

export const personnelService = {
    getPersonnelByBase: async (baseId) => {
        const response = await api.get(`/personnel?size=1000&baseId=${baseId}`);
        return response.data;
    }
};
