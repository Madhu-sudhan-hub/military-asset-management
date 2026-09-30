import React, { useState, useEffect, useContext } from 'react';
import { auditLogService } from '../services/auditLogService';
import { AuthContext } from '../context/AuthContext';
import { 
    ShieldAlert, 
    Filter, 
    Eye,
    ChevronLeft,
    ChevronRight,
    X,
    Lock
} from 'lucide-react';

const AuditLogs = () => {
    const { role } = useContext(AuthContext);

    const [logs, setLogs] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedLog, setSelectedLog] = useState(null);

    const [filters, setFilters] = useState({
        userId: '',
        action: '',
        entityType: '',
        entityId: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        if (role === 'ADMIN') {
            loadLogs();
        }
    }, [page]);

    const loadLogs = async (currentFilters = filters, currentPage = page) => {
        setLoading(true);
        setError('');
        try {
            const params = {
                page: currentPage,
                size: 20
            };
            Object.keys(currentFilters).forEach(k => {
                if (currentFilters[k]) params[k] = currentFilters[k];
            });

            if (params.startDate) params.startDate = params.startDate + 'T00:00:00';
            if (params.endDate) params.endDate = params.endDate + 'T23:59:59';

            const data = await auditLogService.getAuditLogs(params);
            setLogs(data.content || []);
            setTotalPages(data.totalPages || 0);
        } catch (err) {
            setError('Unable to load audit logs.');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const applyFilters = () => {
        setPage(0);
        loadLogs(filters, 0);
    };

    const resetFilters = () => {
        const blank = { userId: '', action: '', entityType: '', entityId: '', startDate: '', endDate: '' };
        setFilters(blank);
        setPage(0);
        loadLogs(blank, 0);
    };

    const viewDetails = async (id) => {
        try {
            const data = await auditLogService.getAuditLogById(id);
            setSelectedLog(data);
        } catch (e) {
            alert('Failed to load log details');
        }
    };

    if (role !== 'ADMIN') {
        return (
            <div className="empty-state">
                <div className="empty-icon" style={{ background: '#fee2e2', color: 'var(--danger)' }}>
                    <Lock size={32} />
                </div>
                <h3>Access Denied</h3>
                <p>You do not have permission to view audit logs. This area is restricted to administrators.</p>
            </div>
        );
    }

    return (
        <div className="page-content-wrapper">
            <div className="page-actions">
                <div></div>
            </div>

            {error && <div className="alert error">{error}</div>}

            <div className="filter-card card" style={{ marginBottom: '24px' }}>
                <div className="filter-header">
                    <h3><Filter size={18} /> Audit Log Filters</h3>
                </div>
                <div className="filter-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
                    <div className="form-group">
                        <label>User ID</label>
                        <input type="text" name="userId" value={filters.userId} onChange={handleFilterChange} className="form-control" placeholder="ID" />
                    </div>
                    <div className="form-group">
                        <label>Action</label>
                        <input type="text" name="action" value={filters.action} onChange={handleFilterChange} className="form-control" placeholder="e.g. LOGIN" />
                    </div>
                    <div className="form-group">
                        <label>Entity Type</label>
                        <input type="text" name="entityType" value={filters.entityType} onChange={handleFilterChange} className="form-control" placeholder="e.g. TRANSFER" />
                    </div>
                    <div className="form-group">
                        <label>Entity ID</label>
                        <input type="text" name="entityId" value={filters.entityId} onChange={handleFilterChange} className="form-control" placeholder="ID" />
                    </div>
                    <div className="form-group">
                        <label>Start Date</label>
                        <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="form-control" />
                    </div>
                    <div className="form-group">
                        <label>End Date</label>
                        <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="form-control" />
                    </div>
                    <div className="filter-actions" style={{ gridColumn: '1 / -1', gap: '12px' }}>
                        <button onClick={resetFilters} className="btn-secondary">Reset</button>
                        <button onClick={applyFilters} className="btn-primary">Apply Filters</button>
                    </div>
                </div>
            </div>

            <div className="table-container">
                {loading ? (
                    <div className="loading-container" style={{ minHeight: '300px' }}>
                        <div className="spinner"></div>
                        <span>Loading audit logs...</span>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="empty-state" style={{ border: 'none' }}>
                        <div className="empty-icon">
                            <ShieldAlert size={32} />
                        </div>
                        <h3>No audit records found</h3>
                        <p>No audit logs match your current filter criteria.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table" style={{ fontSize: '13px' }}>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Date/Time</th>
                                    <th>User</th>
                                    <th>Action</th>
                                    <th>Entity</th>
                                    <th>Entity ID</th>
                                    <th>Description</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map(log => (
                                    <tr key={log.auditLogId}>
                                        <td style={{ color: 'var(--text-secondary)' }}>#{log.auditLogId}</td>
                                        <td style={{ whiteSpace: 'nowrap' }}>{new Date(log.createdAt).toLocaleString()}</td>
                                        <td>
                                            <span style={{ fontWeight: 500 }}>{log.username || 'System'}</span>
                                            {log.userId && <span style={{ color: 'var(--text-secondary)', fontSize: '11px', display: 'block' }}>ID: {log.userId}</span>}
                                        </td>
                                        <td>
                                            <span className="badge badge-base" style={{ background: 'var(--primary-navy)', color: 'white' }}>
                                                {log.action}
                                            </span>
                                        </td>
                                        <td>{log.entityType || '-'}</td>
                                        <td>{log.entityId || '-'}</td>
                                        <td style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={log.description}>
                                            {log.description}
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <button onClick={() => viewDetails(log.auditLogId)} className="icon-btn" title="View Details" style={{ marginLeft: 'auto' }}>
                                                <Eye size={16} />
                                            </button>
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

            {selectedLog && (
                <div className="modal-overlay" onClick={() => setSelectedLog(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                        <div className="modal-header">
                            <h2>Audit Log Details</h2>
                            <button className="close-btn" onClick={() => setSelectedLog(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="card" style={{ marginBottom: '24px', background: '#f8fafc' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Audit ID</p>
                                        <p style={{ margin: 0, fontWeight: 600, fontFamily: 'monospace' }}>#{selectedLog.auditLogId}</p>
                                    </div>
                                    <div>
                                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Timestamp</p>
                                        <p style={{ margin: 0 }}>{new Date(selectedLog.createdAt).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>User</p>
                                        <p style={{ margin: 0, fontWeight: 500 }}>{selectedLog.username || 'System'} <span style={{ color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 'normal' }}>(ID: {selectedLog.userId || '-'})</span></p>
                                    </div>
                                    <div>
                                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Action</p>
                                        <span className="badge" style={{ background: 'var(--primary-navy)', color: 'white' }}>{selectedLog.action}</span>
                                    </div>
                                    <div>
                                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Entity Type</p>
                                        <p style={{ margin: 0 }}>{selectedLog.entityType || '-'}</p>
                                    </div>
                                    <div>
                                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Entity ID</p>
                                        <p style={{ margin: 0, fontFamily: 'monospace' }}>{selectedLog.entityId || '-'}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>Description</p>
                                <div style={{ background: '#f1f5f9', padding: '16px', borderRadius: '8px', fontSize: '14px', lineHeight: '1.5', fontFamily: 'monospace', color: 'var(--primary-navy)' }}>
                                    {selectedLog.description}
                                </div>
                            </div>

                            <div style={{ marginTop: '16px' }}>
                                <p style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>Security Metadata</p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                                    <div>
                                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>IP Address</p>
                                        <p style={{ margin: 0, fontFamily: 'monospace' }}>{selectedLog.ipAddress || 'Not recorded'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setSelectedLog(null)} className="btn-primary">Close Details</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogs;
