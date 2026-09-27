import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { assignmentService } from '../services/assignmentService';
import { baseService, personnelService, assetService } from '../services/dataService';
import { AuthContext } from '../context/AuthContext';

const Assignments = () => {
    const { role } = useContext(AuthContext);
    
    const [assignments, setAssignments] = useState([]);
    const [bases, setBases] = useState([]);
    const [personnelList, setPersonnelList] = useState([]);
    
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
            // Initially load all personnel or handle dynamically, skipping large personnel load for now unless filtered by base
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

    return (
        <div className="page-content">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>Asset Assignments</h2>
                <Link to="/assignments/new" className="btn-primary">+ New Assignment</Link>
            </div>

            {error && <div className="alert error">{error}</div>}

            <div className="filters" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                {role === 'ADMIN' && (
                    <select name="baseId" value={filters.baseId} onChange={handleFilterChange} className="form-control">
                        <option value="">All Bases</option>
                        {bases.map(b => <option key={b.baseId} value={b.baseId}>{b.baseName}</option>)}
                    </select>
                )}
                <select name="status" value={filters.status} onChange={handleFilterChange} className="form-control">
                    <option value="">All Statuses</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="RETURNED">RETURNED</option>
                    <option value="CANCELLED">CANCELLED</option>
                </select>
                <input type="datetime-local" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="form-control" />
                <input type="datetime-local" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="form-control" />
            </div>

            <div className="table-responsive" style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #ccc' }}>
                            <th style={{ padding: '0.5rem' }}>Asset Tag</th>
                            <th style={{ padding: '0.5rem' }}>Personnel</th>
                            <th style={{ padding: '0.5rem' }}>Assigned Date</th>
                            <th style={{ padding: '0.5rem' }}>Status</th>
                            <th style={{ padding: '0.5rem' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '1rem' }}>Loading...</td></tr>
                        ) : assignments.length === 0 ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center', padding: '1rem' }}>No assignments found.</td></tr>
                        ) : (
                            assignments.map(a => (
                                <tr key={a.assignmentId} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '0.5rem' }}>{a.asset?.assetTag}</td>
                                    <td style={{ padding: '0.5rem' }}>{a.personnel?.fullName} ({a.personnel?.employeeNumber})</td>
                                    <td style={{ padding: '0.5rem' }}>{new Date(a.assignedDate).toLocaleString()}</td>
                                    <td style={{ padding: '0.5rem' }}>
                                        <span style={{ 
                                            padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem',
                                            background: a.status === 'ACTIVE' ? '#d4edda' : a.status === 'RETURNED' ? '#cce5ff' : '#f8d7da',
                                            color: a.status === 'ACTIVE' ? '#155724' : a.status === 'RETURNED' ? '#004085' : '#721c24'
                                        }}>
                                            {a.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '0.5rem' }}>
                                        <button onClick={() => setSelectedAssignment(a)} style={{ marginRight: '0.5rem' }}>View</button>
                                        {a.status === 'ACTIVE' && (
                                            <>
                                                <button onClick={() => handleAction(a.assignmentId, 'return')} style={{ marginRight: '0.5rem', color: 'blue' }}>Return</button>
                                                {role === 'ADMIN' && (
                                                    <button onClick={() => handleAction(a.assignmentId, 'cancel')} style={{ color: 'red' }}>Cancel</button>
                                                )}
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

            {selectedAssignment && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="modal-content" style={{ background: '#fff', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '500px' }}>
                        <h3>Assignment Details</h3>
                        <div style={{ marginBottom: '1rem' }}>
                            <p><strong>Asset:</strong> {selectedAssignment.asset?.assetTag}</p>
                            <p><strong>Personnel:</strong> {selectedAssignment.personnel?.fullName} ({selectedAssignment.personnel?.employeeNumber})</p>
                            <p><strong>Base:</strong> {selectedAssignment.personnel?.base?.baseName}</p>
                            <p><strong>Assigned:</strong> {new Date(selectedAssignment.assignedDate).toLocaleString()}</p>
                            <p><strong>Returned:</strong> {selectedAssignment.returnedDate ? new Date(selectedAssignment.returnedDate).toLocaleString() : 'N/A'}</p>
                            <p><strong>Status:</strong> {selectedAssignment.status}</p>
                            <p><strong>Notes:</strong> {selectedAssignment.notes}</p>
                            <p><strong>Assigned By:</strong> {selectedAssignment.assignedByUsername}</p>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={() => setSelectedAssignment(null)} className="btn-primary">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Assignments;
