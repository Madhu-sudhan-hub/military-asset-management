import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { assignmentService } from '../services/assignmentService';
import { baseService } from '../services/dataService';
import { AuthContext } from '../context/AuthContext';
import { 
    ClipboardList, 
    Plus, 
    Filter, 
    Eye, 
    ArrowDownToLine, 
    XCircle,
    X,
    ChevronLeft,
    ChevronRight,
    User
} from 'lucide-react';

const Assignments = () => {
    const { role } = useContext(AuthContext);
    
    const [assignments, setAssignments] = useState([]);
    const [bases, setBases] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [filters, setFilters] = useState({
        personnelId: '',
        assetId: '',
        baseId: '',
        status: '',
        startDate: '',
        endDate: ''
    });

    const [selectedAssignment, setSelectedAssignment] = useState(null);

    useEffect(() => {
        loadDropdowns();
    }, []);

    useEffect(() => {
        loadAssignments();
    }, [page, filters]);

    const loadDropdowns = async () => {
        try {
            const basesRes = await baseService.getAllBases();
            setBases(basesRes.content || []);
        } catch (err) {
            console.error("Failed to load dropdowns");
        }
    };

    const loadAssignments = async () => {
        setLoading(true);
        setError('');
        try {
            const params = { page, size: 10, ...filters };
            Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
            const data = await assignmentService.getAssignments(params);
            setAssignments(data.content);
            setTotalPages(data.totalPages);
        } catch (err) {
            setError('Failed to load assignments');
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
            personnelId: '',
            assetId: '',
            baseId: '',
            status: '',
            startDate: '',
            endDate: ''
        });
        setPage(0);
    };

    const handleAction = async (id, action) => {
        const text = action === 'return' ? 'mark this asset as returned' : 'cancel this assignment';
        if (!window.confirm(`Are you sure you want to ${text}?`)) return;
        try {
            if (action === 'return') {
                await assignmentService.returnAssignment(id);
            } else if (action === 'cancel') {
                await assignmentService.cancelAssignment(id);
            }
            loadAssignments();
            if (selectedAssignment && selectedAssignment.assignmentId === id) {
                setSelectedAssignment(null);
            }
        } catch (err) {
            alert(err.response?.data?.message || `Failed to ${action} assignment`);
        }
    };

    const getStatusBadgeClass = (status) => {
        switch(status) {
            case 'ACTIVE': return 'badge-active';
            case 'RETURNED': return 'badge-inactive';
            case 'CANCELLED': return 'badge-expended';
            default: return 'badge-inactive';
        }
    };

    return (
        <div className="page-content-wrapper">
            <div className="page-actions">
                <div></div>
                <Link to="/assignments/new" className="btn-primary" style={{ textDecoration: 'none' }}>
                    <Plus size={16} /> New Assignment
                </Link>
            </div>

            {error && <div className="alert error">{error}</div>}

            <div className="filter-card card" style={{ marginBottom: '24px' }}>
                <div className="filter-header">
                    <h3><Filter size={18} /> Assignment Filters</h3>
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
                        <label>Status</label>
                        <select name="status" value={filters.status} onChange={handleFilterChange} className="form-control">
                            <option value="">All Statuses</option>
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="RETURNED">RETURNED</option>
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
                        <span>Loading assignments...</span>
                    </div>
                ) : assignments.length === 0 ? (
                    <div className="empty-state" style={{ border: 'none' }}>
                        <div className="empty-icon">
                            <ClipboardList size={32} />
                        </div>
                        <h3>No assignments found</h3>
                        <p>No assignment records match your current filter criteria.</p>
                        <Link to="/assignments/new" className="btn-secondary" style={{ marginTop: '16px', textDecoration: 'none' }}>
                            Create First Assignment
                        </Link>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Asset Tag</th>
                                    <th>Personnel</th>
                                    <th>Assigned Date</th>
                                    <th>Status</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {assignments.map(a => (
                                    <tr key={a.assignmentId}>
                                        <td>
                                            <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{a.asset?.assetTag}</span>
                                        </td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <User size={14} color="#64748b" />
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 500, fontSize: '14px' }}>{a.personnel?.fullName}</div>
                                                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{a.personnel?.employeeNumber}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{new Date(a.assignedDate).toLocaleString()}</td>
                                        <td>
                                            <span className={`badge ${getStatusBadgeClass(a.status)}`}>
                                                {a.status}
                                            </span>
                                        </td>
                                        <td style={{ textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                                                <button onClick={() => setSelectedAssignment(a)} className="icon-btn" title="View Details">
                                                    <Eye size={16} />
                                                </button>
                                                {a.status === 'ACTIVE' && (
                                                    <>
                                                        <button onClick={() => handleAction(a.assignmentId, 'return')} className="icon-btn" style={{ color: '#0284c7' }} title="Mark Returned">
                                                            <ArrowDownToLine size={16} />
                                                        </button>
                                                        {role === 'ADMIN' && (
                                                            <button onClick={() => handleAction(a.assignmentId, 'cancel')} className="icon-btn" style={{ color: 'var(--danger)' }} title="Cancel">
                                                                <XCircle size={16} />
                                                            </button>
                                                        )}
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

            {selectedAssignment && (
                <div className="modal-overlay" onClick={() => setSelectedAssignment(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Assignment Details</h2>
                            <button className="close-btn" onClick={() => setSelectedAssignment(null)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Asset Tag</p>
                                        <p style={{ margin: 0, fontWeight: 600, fontFamily: 'monospace' }}>{selectedAssignment.asset?.assetTag}</p>
                                    </div>
                                    <div>
                                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Status</p>
                                        <span className={`badge ${getStatusBadgeClass(selectedAssignment.status)}`}>
                                            {selectedAssignment.status}
                                        </span>
                                    </div>
                                    <div>
                                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Assigned To</p>
                                        <p style={{ margin: 0, fontWeight: 500 }}>{selectedAssignment.personnel?.fullName}</p>
                                        <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>{selectedAssignment.personnel?.employeeNumber}</p>
                                    </div>
                                    <div>
                                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Base</p>
                                        <p style={{ margin: 0 }}>{selectedAssignment.personnel?.base?.baseName}</p>
                                    </div>
                                </div>
                                
                                <div style={{ height: '1px', background: 'var(--border-color)' }}></div>
                                
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div>
                                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Assigned Date</p>
                                        <p style={{ margin: 0 }}>{new Date(selectedAssignment.assignedDate).toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Returned Date</p>
                                        <p style={{ margin: 0 }}>{selectedAssignment.returnedDate ? new Date(selectedAssignment.returnedDate).toLocaleString() : 'N/A'}</p>
                                    </div>
                                </div>
                                
                                <div style={{ height: '1px', background: 'var(--border-color)' }}></div>
                                
                                <div>
                                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Notes</p>
                                    <p style={{ margin: 0, padding: '12px', background: '#f8fafc', borderRadius: '6px', fontSize: '14px' }}>
                                        {selectedAssignment.notes || 'No notes provided.'}
                                    </p>
                                </div>
                                
                                <div>
                                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: 'var(--text-secondary)' }}>Assigned By</p>
                                    <p style={{ margin: 0, fontSize: '14px' }}>{selectedAssignment.assignedByUsername}</p>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setSelectedAssignment(null)} className="btn-primary">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Assignments;
