import React, { useState, useEffect, useContext } from 'react';
import { purchaseService, baseService, equipmentTypeService } from '../services/dataService';
import { AuthContext } from '../context/AuthContext';

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
        <div className="page-content">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>Purchases</h2>
                <button className="btn-primary" onClick={openCreateModal}>+ Add Purchase</button>
            </div>

            {error && <div className="alert error">{error}</div>}

            <div className="filters" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {role === 'ADMIN' && (
                    <select name="baseId" value={filters.baseId} onChange={handleFilterChange} className="form-control">
                        <option value="">All Bases</option>
                        {bases.map(b => <option key={b.baseId} value={b.baseId}>{b.baseName}</option>)}
                    </select>
                )}
                <select name="equipmentTypeId" value={filters.equipmentTypeId} onChange={handleFilterChange} className="form-control">
                    <option value="">All Equipment</option>
                    {equipmentTypes.map(e => <option key={e.equipmentTypeId} value={e.equipmentTypeId}>{e.equipmentName}</option>)}
                </select>
                <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="form-control" placeholder="Start Date" />
                <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="form-control" placeholder="End Date" />
            </div>

            <div className="table-responsive" style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #ccc' }}>
                            <th style={{ padding: '0.5rem' }}>Ref #</th>
                            <th style={{ padding: '0.5rem' }}>Date</th>
                            <th style={{ padding: '0.5rem' }}>Base</th>
                            <th style={{ padding: '0.5rem' }}>Equipment</th>
                            <th style={{ padding: '0.5rem' }}>Qty</th>
                            <th style={{ padding: '0.5rem' }}>Supplier</th>
                            <th style={{ padding: '0.5rem' }}>Unit Cost</th>
                            <th style={{ padding: '0.5rem' }}>Total Cost</th>
                            <th style={{ padding: '0.5rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="9" style={{ textAlign: 'center', padding: '1rem' }}>Loading...</td></tr>
                        ) : purchases.length === 0 ? (
                            <tr><td colSpan="9" style={{ textAlign: 'center', padding: '1rem' }}>No purchases found.</td></tr>
                        ) : (
                            purchases.map(p => (
                                <tr key={p.purchaseId} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '0.5rem' }}>{p.referenceNumber}</td>
                                    <td style={{ padding: '0.5rem' }}>{p.purchaseDate}</td>
                                    <td style={{ padding: '0.5rem' }}>{p.base?.baseCode}</td>
                                    <td style={{ padding: '0.5rem' }}>{p.equipmentType?.equipmentName}</td>
                                    <td style={{ padding: '0.5rem' }}>{p.quantity}</td>
                                    <td style={{ padding: '0.5rem' }}>{p.supplier}</td>
                                    <td style={{ padding: '0.5rem' }}>${p.unitCost?.toFixed(2)}</td>
                                    <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>${p.totalCost?.toFixed(2)}</td>
                                    <td style={{ padding: '0.5rem' }}>
                                        <button onClick={() => openEditModal(p)} style={{ marginRight: '0.5rem' }}>Edit</button>
                                        {role === 'ADMIN' && (
                                            <button onClick={() => handleDelete(p.purchaseId)} style={{ color: 'red' }}>Delete</button>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="pagination" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</button>
                <span>Page {page + 1} of {totalPages === 0 ? 1 : totalPages}</span>
                <button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Next</button>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="modal-content" style={{ background: '#fff', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '500px' }}>
                        <h3>{formData.purchaseId ? 'Edit Purchase' : 'Add Purchase'}</h3>
                        {formError && <div className="alert error">{formError}</div>}
                        
                        <form onSubmit={savePurchase}>
                            <div className="form-group">
                                <label>Base</label>
                                <select name="baseId" value={formData.baseId} onChange={handleFormChange} required disabled={role !== 'ADMIN'}>
                                    <option value="">Select Base</option>
                                    {bases.map(b => <option key={b.baseId} value={b.baseId}>{b.baseName}</option>)}
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>Equipment Type</label>
                                <select name="equipmentTypeId" value={formData.equipmentTypeId} onChange={handleFormChange} required>
                                    <option value="">Select Equipment</option>
                                    {equipmentTypes.map(e => <option key={e.equipmentTypeId} value={e.equipmentTypeId}>{e.equipmentName}</option>)}
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Quantity</label>
                                    <input type="number" name="quantity" value={formData.quantity} onChange={handleFormChange} required min="1" />
                                </div>
                                <div className="form-group" style={{ flex: 1 }}>
                                    <label>Unit Cost ($)</label>
                                    <input type="number" step="0.01" name="unitCost" value={formData.unitCost} onChange={handleFormChange} required min="0" />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>Total Cost (Calculated by Backend)</label>
                                <input type="text" value={`$${(formData.quantity * formData.unitCost).toFixed(2)}`} disabled />
                            </div>

                            <div className="form-group">
                                <label>Purchase Date</label>
                                <input type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleFormChange} required />
                            </div>

                            <div className="form-group">
                                <label>Reference Number</label>
                                <input type="text" name="referenceNumber" value={formData.referenceNumber} onChange={handleFormChange} required />
                            </div>

                            <div className="form-group">
                                <label>Supplier</label>
                                <input type="text" name="supplier" value={formData.supplier} onChange={handleFormChange} required />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1.5rem' }}>
                                <button type="button" onClick={() => setShowModal(false)} disabled={saving}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Purchase'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Purchases;
