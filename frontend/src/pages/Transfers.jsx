import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { transferService } from '../services/transferService';
import { baseService, equipmentTypeService } from '../services/dataService';
import { AuthContext } from '../context/AuthContext';
import { 
    ArrowRightLeft, 
    Plus, 
    Filter, 
    Eye, 
    CheckCircle, 
    XCircle,
    X,
    ChevronLeft,
    ChevronRight,
    ArrowRight
} from 'lucide-react';

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

    const resetFilters = () => {
        setFilters({
            fromBaseId: '',
            toBaseId: '',
            status: '',
            startDate: '',
            endDate: ''
        });
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

    const getStatusBadgeClass = (status) => {
        switch(status) {
            case 'COMPLETED': return 'badge-active';
            case 'PENDING': return 'badge-pending';
            case 'CANCELLED': return 'badge-expended';
            default: return 'badge-inactive';
        }
    };

    return (
        <div className="page-content-wrapper">
            <div className="page-actions">
                <div></div>
                <Link to="/transfers/new" className="btn-primary" style={{ textDecoration: 'none' }}>
                    <Plus size={16} /> New Transfer
                </Link>
            </div>

            {error && <div className="alert error">{error}</div>}

            <div className="filter-card card" style={{ marginBottom: '24px' }}>
                <div className="filter-header">
                    <h3><Filter size={18} /> Transfer Filters</h3>
                </div>
                <div className="filter-grid">
                    <div className="form-group">
                        <label>From Base</label>
                        <select name="fromBaseId" value={filters.fromBaseId} onChange={handleFilterChange} className="form-control">
                            <option value="">All Bases</option>
                            {bases.map(b => <option key={b.baseId} value={b.baseId}>{b.baseName}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>To Base</label>
                        <select name="toBaseId" value={filters.toBaseId} onChange={handleFilterChange} className="form-control">
                            <option value="">All Bases</option>
                            {bases.map(b => <option key={b.baseId} value={b.baseId}>{b.baseName}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Status</label>
                        <select name="status" value={filters.status} onChange={handleFilterChange} className="form-control">
                            <option value="">All Statuses</option>
                            <option value="PENDING">PENDING</option>
                            <option value="COMPLETED">COMPLETED</option>
                            <option value="CANCELLED">CANCELLED</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Start Date</label>
                        <input type="datetime-local" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="form-control" />
                    </div>
                    <div className="form-group">
                        <label>End Date</label>
                        <input type="datetime-local" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="form-control" />
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
                        <span>Loading transfers...</span>
                    </div>
                ) : transfers.length === 0 ? (
                    <div className="empty-state" style={{ border: 'none' }}>
                        <div className="empty-icon">
                            <ArrowRightLeft size={32} />
                        </div>
                        <h3>No transfers found</h3>
                        <p>No transfer records match your current filter criteria.</p>
                        <Link to="/transfers/new" className="btn-secondary" style={{ marginTop: '16px', textDecoration: 'none' }}>
                            Create First Transfer
                        </Link>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Ref #</th>
                                    <th>Date</th>
                                    <th>Route</th>
                                    <th>Status</th>
                                    <th>Initiated By</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transfers.map(t => (
                                    <tr key={t.transferId}>
                                        <td><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{t.referenceNumber}</span></td>
                                        <td>{new Date(t.transferDate).toLocaleString()}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <span className="badge badge-base">{t.fromBase?.baseCode}</span>
                                                <ArrowRight size={14} color="var(--text-secondary)" />
                                                <span className="badge badge-base">{t.toBase?.baseCode}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge ${getStatusBadgeClass(t.status)}`}>
                                                {t.status}
                                            </span>
                                        </td>
                                        <td>{t.initiatedByUsername}</td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                <button onClick={() => setSelectedTransfer(t)} className="icon-btn" title="View Details">
                                                    <Eye size={16} />
                                                </button>
                                                {t.status === 'PENDING' && (
                                                    <>
                                                        <button onClick={() => handleAction(t.transferId, 'complete')} className="icon-btn" style={{ color: 'var(--military-green)' }} title="Complete">
                                                            <CheckCircle size={16} />
                                                        </button>
                                                        <button onClick={() => handleAction(t.transferId, 'cancel')} className="icon-btn" style={{ color: 'var(--danger)' }} title="Cancel">
                                                            <XCircle size={16} />
                                                        </button>
                                                    </>
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

            {selectedTransfer && (
                <div className="modal-overlay" onClick={() => setSelectedTransfer(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h2>Transfer Details</h2>
                            <button className="close-btn" onClick={() => setSelectedTransfer(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="card" style={{ marginBottom: '24px', background: '#f8fafc' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Reference Number</p>
                                        <p style={{ margin: 0, fontWeight: 600, fontFamily: 'monospace' }}>{selectedTransfer.referenceNumber}</p>
                                    </div>
                                    <div>
                                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Status</p>
                                        <span className={`badge ${getStatusBadgeClass(selectedTransfer.status)}`}>
                                            {selectedTransfer.status}
                                        </span>
                                    </div>
                                    <div>
                                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>From Base</p>
                                        <p style={{ margin: 0, fontWeight: 500 }}>{selectedTransfer.fromBase?.baseName}</p>
                                    </div>
                                    <div>
                                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>To Base</p>
                                        <p style={{ margin: 0, fontWeight: 500 }}>{selectedTransfer.toBase?.baseName}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <h3 className="section-title">Transfer Items</h3>
                            <div className="table-container">
                                <table className="data-table">
                                    <thead>
                                        <tr>
                                            <th>Equipment</th>
                                            <th>Asset Tag</th>
                                            <th style={{ textAlign: 'right' }}>Quantity</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {selectedTransfer.items?.map(i => (
                                            <tr key={i.transferItemId}>
                                                <td>{i.equipmentType?.equipmentName}</td>
                                                <td>
                                                    {i.asset ? (
                                                        <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{i.asset.assetTag}</span>
                                                    ) : (
                                                        <span style={{ color: 'var(--text-secondary)' }}>N/A (Bulk)</span>
                                                    )}
                                                </td>
                                                <td style={{ textAlign: 'right', fontWeight: 600 }}>{i.quantity}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setSelectedTransfer(null)} className="btn-primary">Close Details</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Transfers;
