import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { expenditureService } from '../services/expenditureService';
import { baseService, equipmentTypeService } from '../services/dataService';
import { AuthContext } from '../context/AuthContext';
import { 
    Banknote, 
    Plus, 
    Filter, 
    Search,
    ChevronLeft,
    ChevronRight,
    FileMinus
} from 'lucide-react';

const Expenditures = () => {
    const { role } = useContext(AuthContext);
    
    const [expenditures, setExpenditures] = useState([]);
    const [bases, setBases] = useState([]);
    const [equipmentTypes, setEquipmentTypes] = useState([]);
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [filters, setFilters] = useState({
        baseId: '',
        equipmentTypeId: '',
        assetId: '',
        reason: '',
        startDate: '',
        endDate: ''
    });

    useEffect(() => {
        loadDropdowns();
    }, []);

    useEffect(() => {
        loadExpenditures();
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

    const loadExpenditures = async () => {
        setLoading(true);
        setError('');
        try {
            const params = { page, size: 10, ...filters };
            Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
            const data = await expenditureService.getExpenditures(params);
            setExpenditures(data.content);
            setTotalPages(data.totalPages);
        } catch (err) {
            setError('Failed to load expenditures');
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
            baseId: '',
            equipmentTypeId: '',
            assetId: '',
            reason: '',
            startDate: '',
            endDate: ''
        });
        setPage(0);
    };

    return (
        <div className="page-content-wrapper">
            <div className="page-actions">
                <div></div>
                <Link to="/expenditures/new" className="btn-primary" style={{ textDecoration: 'none' }}>
                    <Plus size={16} /> Record Expenditure
                </Link>
            </div>

            {error && <div className="alert error">{error}</div>}

            <div className="filter-card card" style={{ marginBottom: '24px' }}>
                <div className="filter-header">
                    <h3><Filter size={18} /> Expenditure Filters</h3>
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
                        <input type="datetime-local" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="form-control" />
                    </div>
                    <div className="form-group">
                        <label>End Date</label>
                        <input type="datetime-local" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="form-control" />
                    </div>
                    <div className="form-group">
                        <label>Search Reason</label>
                        <div className="input-with-icon">
                            <Search size={16} className="search-icon" style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />
                            <input type="text" name="reason" value={filters.reason} onChange={handleFilterChange} className="form-control" placeholder="Search..." style={{ paddingLeft: '32px' }} />
                        </div>
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
                        <span>Loading expenditures...</span>
                    </div>
                ) : expenditures.length === 0 ? (
                    <div className="empty-state" style={{ border: 'none' }}>
                        <div className="empty-icon">
                            <FileMinus size={32} />
                        </div>
                        <h3>No expenditures found</h3>
                        <p>No expenditure records match your current filter criteria.</p>
                        <Link to="/expenditures/new" className="btn-secondary" style={{ marginTop: '16px', textDecoration: 'none' }}>
                            Record First Expenditure
                        </Link>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Ref #</th>
                                    <th>Base</th>
                                    <th>Equipment</th>
                                    <th>Asset Tag</th>
                                    <th>Qty</th>
                                    <th>Date</th>
                                    <th>Reason</th>
                                    <th>Recorded By</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenditures.map(e => (
                                    <tr key={e.expenditureId}>
                                        <td><span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{e.referenceNumber}</span></td>
                                        <td>
                                            <span className="badge badge-base">{e.base?.baseCode}</span>
                                        </td>
                                        <td>{e.equipmentType?.equipmentName}</td>
                                        <td>
                                            {e.asset ? (
                                                <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{e.asset.assetTag}</span>
                                            ) : (
                                                <span style={{ color: 'var(--text-secondary)' }}>N/A (Bulk)</span>
                                            )}
                                        </td>
                                        <td style={{ fontWeight: 600, color: 'var(--danger)' }}>-{e.quantity}</td>
                                        <td>{new Date(e.expenditureDate).toLocaleString()}</td>
                                        <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={e.reason}>
                                            {e.reason}
                                        </td>
                                        <td>{e.recordedByUsername}</td>
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
        </div>
    );
};

export default Expenditures;
