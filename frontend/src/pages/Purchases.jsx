import React, { useState, useEffect, useContext } from 'react';
import { purchaseService, baseService, equipmentTypeService } from '../services/dataService';
import { AuthContext } from '../context/AuthContext';
import { 
    Plus, 
    Filter, 
    Edit, 
    Trash2, 
    X,
    ChevronLeft,
    ChevronRight,
    ShoppingCart
} from 'lucide-react';

const Purchases = () => {
    const { role, baseId: userBaseId } = useContext(AuthContext);
    
    const [purchases, setPurchases] = useState([]);
    const [bases, setBases] = useState([]);
    const [equipmentTypes, setEquipmentTypes] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    // Pagination & Filters
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [filters, setFilters] = useState({
        baseId: role === 'ADMIN' ? '' : userBaseId,
        equipmentTypeId: '',
        startDate: '',
        endDate: ''
    });

    // Form Modal State
    const [showModal, setShowModal] = useState(false);
    const [formError, setFormError] = useState('');
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        purchaseId: null,
        baseId: role === 'ADMIN' ? '' : userBaseId,
        equipmentTypeId: '',
        quantity: 1,
        purchaseDate: new Date().toISOString().split('T')[0],
        supplier: '',
        referenceNumber: '',
        unitCost: 0
    });

    useEffect(() => {
        loadDropdownData();
    }, []);

    useEffect(() => {
        loadPurchases();
    }, [page, filters]);

    const loadDropdownData = async () => {
        try {
            const [basesRes, eqRes] = await Promise.all([
                baseService.getAllBases(),
                equipmentTypeService.getAllEquipmentTypes()
            ]);
            setBases(basesRes.content || []);
            setEquipmentTypes(eqRes.content || []);
        } catch (err) {
            console.error("Error loading dropdowns", err);
        }
    };

    const loadPurchases = async () => {
        setLoading(true);
        setError('');
        try {
            const params = { page, size: 10 };
            if (filters.baseId) params.baseId = filters.baseId;
            if (filters.equipmentTypeId) params.equipmentTypeId = filters.equipmentTypeId;
            if (filters.startDate) params.startDate = filters.startDate;
            if (filters.endDate) params.endDate = filters.endDate;

            const data = await purchaseService.getAllPurchases(params);
            setPurchases(data.content);
            setTotalPages(data.totalPages);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load purchases.');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
        setPage(0); // Reset to first page
    };

    const resetFilters = () => {
        setFilters({
            baseId: role === 'ADMIN' ? '' : userBaseId,
            equipmentTypeId: '',
            startDate: '',
            endDate: ''
        });
        setPage(0);
    };

    const openCreateModal = () => {
        setFormData({
            purchaseId: null,
            baseId: role === 'ADMIN' ? '' : userBaseId,
            equipmentTypeId: '',
            quantity: 1,
            purchaseDate: new Date().toISOString().split('T')[0],
            supplier: '',
            referenceNumber: '',
            unitCost: 0
        });
        setFormError('');
        setShowModal(true);
    };

    const openEditModal = (purchase) => {
        setFormData({
            purchaseId: purchase.purchaseId,
            baseId: purchase.base.baseId,
            equipmentTypeId: purchase.equipmentType.equipmentTypeId,
            quantity: purchase.quantity,
            purchaseDate: purchase.purchaseDate,
            supplier: purchase.supplier,
            referenceNumber: purchase.referenceNumber,
            unitCost: purchase.unitCost
        });
        setFormError('');
        setShowModal(true);
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const savePurchase = async (e) => {
        e.preventDefault();
        setFormError('');
        setSaving(true);
        
        try {
            const payload = {
                baseId: parseInt(formData.baseId),
                equipmentTypeId: parseInt(formData.equipmentTypeId),
                quantity: parseInt(formData.quantity),
                purchaseDate: formData.purchaseDate,
                supplier: formData.supplier,
                referenceNumber: formData.referenceNumber,
                unitCost: parseFloat(formData.unitCost)
            };

            if (formData.purchaseId) {
                await purchaseService.updatePurchase(formData.purchaseId, payload);
            } else {
                await purchaseService.createPurchase(payload);
            }
            setShowModal(false);
            loadPurchases();
        } catch (err) {
            if (err.response?.data?.message) {
                setFormError(err.response.data.message);
            } else if (err.response?.data?.error === 'VALIDATION_ERROR') {
                setFormError('Please check your inputs.');
            } else {
                setFormError('Failed to save purchase.');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this purchase? This may affect inventory calculations.')) return;
        try {
            await purchaseService.deletePurchase(id);
            loadPurchases();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete purchase.');
        }
    };

    return (
        <div className="page-content-wrapper">
            <div className="page-actions">
                <div></div>
                <button className="btn-primary" onClick={openCreateModal}>
                    <Plus size={16} /> New Purchase
                </button>
            </div>

            {error && <div className="alert error">{error}</div>}

            <div className="filter-card card" style={{ marginBottom: '24px' }}>
                <div className="filter-header">
                    <h3><Filter size={18} /> Purchase Filters</h3>
                </div>
                <div className="filter-grid">
                    {role === 'ADMIN' && (
                        <div className="form-group">
                            <label>Base Location</label>
                            <select name="baseId" value={filters.baseId} onChange={handleFilterChange} className="form-control">
                                <option value="">All Bases</option>
                                {bases.map(b => <option key={b.baseId} value={b.baseId}>{b.baseName}</option>)}
                            </select>
                        </div>
                    )}
                    <div className="form-group">
                        <label>Equipment Type</label>
                        <select name="equipmentTypeId" value={filters.equipmentTypeId} onChange={handleFilterChange} className="form-control">
                            <option value="">All Equipment</option>
                            {equipmentTypes.map(e => <option key={e.equipmentTypeId} value={e.equipmentTypeId}>{e.equipmentName}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Start Date</label>
                        <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="form-control" />
                    </div>
                    <div className="form-group">
                        <label>End Date</label>
                        <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="form-control" />
                    </div>
                    <div className="filter-actions" style={{ gridColumn: '1 / -1' }}>
                        <button onClick={resetFilters} className="btn-secondary">Reset Filters</button>
                    </div>
                </div>
            </div>

            <div className="table-container">
                {loading ? (
                    <div className="loading-container" style={{ minHeight: '300px' }}>
                        <div className="spinner"></div>
                        <span>Loading purchases...</span>
                    </div>
                ) : purchases.length === 0 ? (
                    <div className="empty-state" style={{ border: 'none' }}>
                        <div className="empty-icon">
                            <ShoppingCart size={32} />
                        </div>
                        <h3>No purchases found</h3>
                        <p>No purchase records match your current filter criteria.</p>
                        <button className="btn-secondary" style={{ marginTop: '16px' }} onClick={openCreateModal}>
                            Record First Purchase
                        </button>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Ref #</th>
                                    <th>Date</th>
                                    <th>Base</th>
                                    <th>Equipment</th>
                                    <th>Qty</th>
                                    <th>Supplier</th>
                                    <th>Unit Cost</th>
                                    <th>Total Cost</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {purchases.map(p => (
                                    <tr key={p.purchaseId}>
                                        <td><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.referenceNumber}</span></td>
                                        <td>{p.purchaseDate}</td>
                                        <td>
                                            <span className="badge badge-base">{p.base?.baseCode}</span>
                                        </td>
                                        <td>{p.equipmentType?.equipmentName}</td>
                                        <td>{p.quantity}</td>
                                        <td>{p.supplier}</td>
                                        <td>${p.unitCost?.toFixed(2)}</td>
                                        <td style={{ fontWeight: 600 }}>${p.totalCost?.toFixed(2)}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                <button onClick={() => openEditModal(p)} className="icon-btn" title="Edit">
                                                    <Edit size={16} />
                                                </button>
                                                {role === 'ADMIN' && (
                                                    <button onClick={() => handleDelete(p.purchaseId)} className="icon-btn" style={{ color: 'var(--danger)' }} title="Delete">
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {!loading && totalPages > 1 && (
                <div className="pagination" style={{ 
                    display: 'flex', 
                    justifyContent: 'flex-end', 
                    alignItems: 'center', 
                    gap: '16px', 
                    marginTop: '24px' 
                }}>
                    <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        Page {page + 1} of {totalPages}
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                            onClick={() => setPage(p => Math.max(0, p - 1))} 
                            disabled={page === 0}
                            className="btn-secondary"
                            style={{ padding: '8px' }}
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} 
                            disabled={page >= totalPages - 1}
                            className="btn-secondary"
                            style={{ padding: '8px' }}
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => !saving && setShowModal(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{formData.purchaseId ? 'Edit Purchase' : 'Add New Purchase'}</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)} disabled={saving}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            {formError && <div className="alert error">{formError}</div>}
                            
                            <form id="purchase-form" onSubmit={savePurchase}>
                                <div className="form-group">
                                    <label>Base Location</label>
                                    <select name="baseId" value={formData.baseId} onChange={handleFormChange} required disabled={role !== 'ADMIN'} className="form-control">
                                        <option value="">Select Base</option>
                                        {bases.map(b => <option key={b.baseId} value={b.baseId}>{b.baseName}</option>)}
                                    </select>
                                </div>
                                
                                <div className="form-group">
                                    <label>Equipment Type</label>
                                    <select name="equipmentTypeId" value={formData.equipmentTypeId} onChange={handleFormChange} required className="form-control">
                                        <option value="">Select Equipment</option>
                                        {equipmentTypes.map(e => <option key={e.equipmentTypeId} value={e.equipmentTypeId}>{e.equipmentName}</option>)}
                                    </select>
                                </div>

                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Quantity</label>
                                        <input type="number" name="quantity" value={formData.quantity} onChange={handleFormChange} required min="1" className="form-control" />
                                    </div>
                                    <div className="form-group" style={{ flex: 1 }}>
                                        <label>Unit Cost ($)</label>
                                        <input type="number" step="0.01" name="unitCost" value={formData.unitCost} onChange={handleFormChange} required min="0" className="form-control" />
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label>Total Cost</label>
                                    <input type="text" value={`$${(formData.quantity * formData.unitCost).toFixed(2)}`} disabled className="form-control" style={{ background: '#f8fafc', fontWeight: 600 }} />
                                </div>

                                <div className="form-group">
                                    <label>Purchase Date</label>
                                    <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleFormChange} required className="form-control" />
                                </div>

                                <div className="form-group">
                                    <label>Reference Number</label>
                                    <input type="text" name="referenceNumber" value={formData.referenceNumber} onChange={handleFormChange} required className="form-control" placeholder="PO-12345" />
                                </div>

                                <div className="form-group">
                                    <label>Supplier</label>
                                    <input type="text" name="supplier" value={formData.supplier} onChange={handleFormChange} required className="form-control" placeholder="Vendor Name" />
                                </div>
                            </form>
                        </div>
                        <div className="modal-footer">
                            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary" disabled={saving}>Cancel</button>
                            <button type="submit" form="purchase-form" className="btn-primary" disabled={saving}>
                                {saving ? 'Saving...' : 'Save Purchase'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Purchases;
