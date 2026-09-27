import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { transferService } from '../services/transferService';
import { baseService, equipmentTypeService } from '../services/dataService';
import { AuthContext } from '../context/AuthContext';

const Transfers = () => {
    const { role } = useContext(AuthContext);
    
    const [transfers, setTransfers] = useState([]);
    const [bases, setBases] = useState([]);
    const [equipmentTypes, setEquipmentTypes] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [filters, setFilters] = useState({
        fromBaseId: '',
        toBaseId: '',
        status: '',
        startDate: '',
        endDate: ''
    });

    const [selectedTransfer, setSelectedTransfer] = useState(null);

    useEffect(() => {
        loadDropdowns();
    }, []);

    useEffect(() => {
        loadTransfers();
    }, [page, filters]);

    const loadDropdowns = async () => {
        try {
            const [basesRes, eqRes] = await Promise.all([
                baseService.getAllBases(),
                equipmentTypeService.getAllEquipmentTypes()
            ]);
            setBases(basesRes.content || []);
            setEquipmentTypes(eqRes.content || []);
        } catch (err) {
            console.error("Failed to load dropdowns");
        }
    };

    const loadTransfers = async () => {
        setLoading(true);
        setError('');
        try {
            const params = { page, size: 10, ...filters };
            Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
            const data = await transferService.getTransfers(params);
            setTransfers(data.content);
            setTotalPages(data.totalPages);
        } catch (err) {
            setError('Failed to load transfers');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
        setPage(0);
    };

    const handleAction = async (id, action) => {
        if (!window.confirm(`Are you sure you want to ${action} this transfer?`)) return;
        try {
            if (action === 'complete') {
                await transferService.completeTransfer(id);
            } else if (action === 'cancel') {
                await transferService.cancelTransfer(id);
            }
            loadTransfers();
            if (selectedTransfer && selectedTransfer.transferId === id) {
                setSelectedTransfer(null);
            }
        } catch (err) {
            alert(err.response?.data?.message || `Failed to ${action} transfer`);
        }
    };

    return (
        <div className="page-content">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>Equipment Transfers</h2>
                <Link to="/transfers/new" className="btn-primary">+ New Transfer</Link>
            </div>

            {error && <div className="alert error">{error}</div>}

            <div className="filters" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <select name="fromBaseId" value={filters.fromBaseId} onChange={handleFilterChange} className="form-control">
                    <option value="">From Base (All)</option>
                    {bases.map(b => <option key={b.baseId} value={b.baseId}>{b.baseName}</option>)}
                </select>
                <select name="toBaseId" value={filters.toBaseId} onChange={handleFilterChange} className="form-control">
                    <option value="">To Base (All)</option>
                    {bases.map(b => <option key={b.baseId} value={b.baseId}>{b.baseName}</option>)}
                </select>
                <select name="status" value={filters.status} onChange={handleFilterChange} className="form-control">
                    <option value="">All Statuses</option>
                    <option value="PENDING">PENDING</option>
                    <option value="COMPLETED">COMPLETED</option>
                    <option value="CANCELLED">CANCELLED</option>
                </select>
                <input type="datetime-local" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="form-control" />
                <input type="datetime-local" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="form-control" />
            </div>

            <div className="table-responsive" style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #ccc' }}>
                            <th style={{ padding: '0.5rem' }}>Ref #</th>
                            <th style={{ padding: '0.5rem' }}>Date</th>
                            <th style={{ padding: '0.5rem' }}>From Base</th>
                            <th style={{ padding: '0.5rem' }}>To Base</th>
                            <th style={{ padding: '0.5rem' }}>Status</th>
                            <th style={{ padding: '0.5rem' }}>Initiated By</th>
                            <th style={{ padding: '0.5rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '1rem' }}>Loading...</td></tr>
                        ) : transfers.length === 0 ? (
                            <tr><td colSpan="7" style={{ textAlign: 'center', padding: '1rem' }}>No transfers found.</td></tr>
                        ) : (
                            transfers.map(t => (
                                <tr key={t.transferId} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '0.5rem' }}>{t.referenceNumber}</td>
                                    <td style={{ padding: '0.5rem' }}>{new Date(t.transferDate).toLocaleString()}</td>
                                    <td style={{ padding: '0.5rem' }}>{t.fromBase?.baseName}</td>
                                    <td style={{ padding: '0.5rem' }}>{t.toBase?.baseName}</td>
                                    <td style={{ padding: '0.5rem' }}>
                                        <span style={{ 
                                            padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem',
                                            background: t.status === 'COMPLETED' ? '#d4edda' : t.status === 'PENDING' ? '#fff3cd' : '#f8d7da',
                                            color: t.status === 'COMPLETED' ? '#155724' : t.status === 'PENDING' ? '#856404' : '#721c24'
                                        }}>
                                            {t.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.5rem' }}>{t.initiatedByUsername}</td>
                                    <td style={{ padding: '0.5rem' }}>
                                        <button onClick={() => setSelectedTransfer(t)} style={{ marginRight: '0.5rem' }}>View</button>
                                        {t.status === 'PENDING' && (
                                            <>
                                                <button onClick={() => handleAction(t.transferId, 'complete')} style={{ marginRight: '0.5rem', color: 'green' }}>Complete</button>
                                                <button onClick={() => handleAction(t.transferId, 'cancel')} style={{ color: 'red' }}>Cancel</button>
                                            </>
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

            {selectedTransfer && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="modal-content" style={{ background: '#fff', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '600px' }}>
                        <h3>Transfer Details</h3>
                        <div style={{ marginBottom: '1rem' }}>
                            <p><strong>Ref:</strong> {selectedTransfer.referenceNumber}</p>
                            <p><strong>From:</strong> {selectedTransfer.fromBase?.baseName}</p>
                            <p><strong>To:</strong> {selectedTransfer.toBase?.baseName}</p>
                            <p><strong>Status:</strong> {selectedTransfer.status}</p>
                        </div>
                        
                        <h4>Items</h4>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', marginBottom: '1.5rem' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #ccc' }}>
                                    <th>Equipment</th>
                                    <th>Asset Tag</th>
                                    <th>Quantity</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedTransfer.items?.map(i => (
                                    <tr key={i.transferItemId} style={{ borderBottom: '1px solid #eee' }}>
                                        <td>{i.equipmentType?.equipmentName}</td>
                                        <td>{i.asset ? i.asset.assetTag : 'N/A (Bulk)'}</td>
                                        <td>{i.quantity}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={() => setSelectedTransfer(null)} className="btn-primary">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transfers;
