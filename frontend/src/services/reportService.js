import api from './api';

export const reportService = {
    getInventoryReport: async (params) => {
        const res = await api.get('/reports/inventory', { params });
        return res.data;
    },
    exportInventory: (format, params) => {
        return api.get(`/reports/inventory/export/${format}`, { params, responseType: 'blob' });
    },

    getPurchaseReport: async (params) => {
        const res = await api.get('/reports/purchases', { params });
        return res.data;
    },
    exportPurchases: (format, params) => {
        return api.get(`/reports/purchases/export/${format}`, { params, responseType: 'blob' });
    },

    getTransferReport: async (params) => {
        const res = await api.get('/reports/transfers', { params });
        return res.data;
    },
    exportTransfers: (format, params) => {
        return api.get(`/reports/transfers/export/${format}`, { params, responseType: 'blob' });
    },

    getAssignmentReport: async (params) => {
        const res = await api.get('/reports/assignments', { params });
        return res.data;
    },
    exportAssignments: (format, params) => {
        return api.get(`/reports/assignments/export/${format}`, { params, responseType: 'blob' });
    },

    getExpenditureReport: async (params) => {
        const res = await api.get('/reports/expenditures', { params });
        return res.data;
    },
    exportExpenditures: (format, params) => {
        return api.get(`/reports/expenditures/export/${format}`, { params, responseType: 'blob' });
    },

    getAssetReport: async (params) => {
        const res = await api.get('/reports/assets', { params });
        return res.data;
    },
    exportAssets: (format, params) => {
        return api.get(`/reports/assets/export/${format}`, { params, responseType: 'blob' });
    },

    getAuditReport: async (params) => {
        const res = await api.get('/reports/audit-activity', { params });
        return res.data;
    },
    exportAuditActivity: (format, params) => {
        return api.get(`/reports/audit-activity/export/${format}`, { params, responseType: 'blob' });
    },

    downloadBlob: (blob, filename) => {
        const url = window.URL.createObjectURL(new Blob([blob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
    }
};
