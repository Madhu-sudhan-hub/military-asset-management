import React, { useState, useEffect, useContext } from 'react';
import { auditLogService } from '../services/auditLogService';
import { AuthContext } from '../context/AuthContext';

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
        } else {
            setError("You do not have permission to view audit logs.");
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

            // Convert dates to proper ISO if needed, but backend takes them directly if properly formatted
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
            <div className="page-content">
                <div className="alert error">You do not have permission to view audit logs.</div>
            </div>
        );
    }

    return (
        <div className="page-content">
            <div className="page-header">
                <h2>Audit Logs</h2>
            </div>

            <div className="filters audit-filters" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'flex-end', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#6c757d' }}>User ID</label>
                    <input type="text" name="userId" value={filters.userId} onChange={handleFilterChange} className="form-control" placeholder="User ID" />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#6c757d' }}>Action</label>
                    <input type="text" name="action" value={filters.action} onChange={handleFilterChange} className="form-control" placeholder="e.g. LOGIN" />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#6c757d' }}>Entity Type</label>
                    <input type="text" name="entityType" value={filters.entityType} onChange={handleFilterChange} className="form-control" placeholder="e.g. TRANSFER" />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#6c757d' }}>Entity ID</label>
                    <input type="text" name="entityId" value={filters.entityId} onChange={handleFilterChange} className="form-control" placeholder="Entity ID" />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#6c757d' }}>Start Date</label>
                    <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="form-control" />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#6c757d' }}>End Date</label>
                    <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="form-control" />
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={applyFilters} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Apply</button>
                    <button onClick={resetFilters} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>Reset</button>
                </div>
            </div>

            {error && <div className="alert error">{error}</div>}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <h3>Loading Audit Logs...</h3>
                </div>
            ) : logs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: '#f8f9fa', borderRadius: '8px' }}>
                    <h3 style={{ color: '#6c757d' }}>No audit records found for the selected filters.</h3>
                </div>
            ) : (
                <div className="table-responsive">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Date/Time</th>
                                <th>User</th>
                                <th>Action</th>
                                <th>Entity Type</th>
                                <th>Entity ID</th>
                                <th>Description</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map(log => (
                                <tr key={log.auditLogId}>
                                    <td>{log.auditLogId}</td>
                                    <td>{new Date(log.createdAt).toLocaleString()}</td>
                                    <td>{log.username || 'System'} (ID: {log.userId || '-'})</td>
                                    <td><span className="badge" style={{ background: '#007bff' }}>{log.action}</span></td>
                                    <td>{log.entityType || '-'}</td>
                                    <td>{log.entityId || '-'}</td>
                                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{log.description}</td>
                                    <td>
                                        <button className="btn-secondary" onClick={() => viewDetails(log.auditLogId)}>View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {!loading && totalPages > 1 && (
                <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Previous</button>
                    <span>Page {page + 1} of {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}>Next</button>
                </div>
            )}

            {selectedLog && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="modal-content" style={{ background: '#fff', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '500px' }}>
                        <h3 style={{ marginTop: 0 }}>Audit Log Details</h3>
                        <div style={{ margin: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <div><strong>Audit ID:</strong> {selectedLog.auditLogId}</div>
                            <div><strong>Timestamp:</strong> {new Date(selectedLog.createdAt).toLocaleString()}</div>
                            <div><strong>User:</strong> {selectedLog.username || 'System'} (ID: {selectedLog.userId || '-'})</div>
                            <div><strong>Action:</strong> <span className="badge" style={{ background: '#007bff' }}>{selectedLog.action}</span></div>
                            <div><strong>Entity Type:</strong> {selectedLog.entityType || '-'}</div>
                            <div><strong>Entity ID:</strong> {selectedLog.entityId || '-'}</div>
                            <div><strong>IP Address:</strong> {selectedLog.ipAddress || '-'}</div>
                            <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '4px', border: '1px solid #dee2e6' }}>
                                <strong>Description:</strong><br />
                                {selectedLog.description}
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={() => setSelectedLog(null)} className="btn-primary">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuditLogs;
