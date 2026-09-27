import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { expenditureService } from '../services/expenditureService';
import { baseService, equipmentTypeService } from '../services/dataService';
import { AuthContext } from '../context/AuthContext';

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

    return (
        <div className="page-content">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2>Equipment Expenditures</h2>
                <Link to="/expenditures/new" className="btn-primary">+ Record Expenditure</Link>
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
                <input type="datetime-local" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="form-control" />
                <input type="datetime-local" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="form-control" />
                <input type="text" name="reason" value={filters.reason} onChange={handleFilterChange} className="form-control" placeholder="Search Reason..." />
            </div>

            <div className="table-responsive" style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid #ccc' }}>
                            <th style={{ padding: '0.5rem' }}>Ref #</th>
                            <th style={{ padding: '0.5rem' }}>Base</th>
                            <th style={{ padding: '0.5rem' }}>Equipment</th>
                            <th style={{ padding: '0.5rem' }}>Asset Tag</th>
                            <th style={{ padding: '0.5rem' }}>Qty</th>
                            <th style={{ padding: '0.5rem' }}>Date</th>
                            <th style={{ padding: '0.5rem' }}>Reason</th>
                            <th style={{ padding: '0.5rem' }}>Recorded By</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '1rem' }}>Loading...</td></tr>
                        ) : expenditures.length === 0 ? (
                            <tr><td colSpan="8" style={{ textAlign: 'center', padding: '1rem' }}>No expenditures found.</td></tr>
                        ) : (
                            expenditures.map(e => (
                                <tr key={e.expenditureId} style={{ borderBottom: '1px solid #eee' }}>
                                    <td style={{ padding: '0.5rem' }}>{e.referenceNumber}</td>
                                    <td style={{ padding: '0.5rem' }}>{e.base?.baseName}</td>
                                    <td style={{ padding: '0.5rem' }}>{e.equipmentType?.equipmentName}</td>
                                    <td style={{ padding: '0.5rem' }}>{e.asset ? e.asset.assetTag : 'N/A (Bulk)'}</td>
                                    <td style={{ padding: '0.5rem' }}>{e.quantity}</td>
                                    <td style={{ padding: '0.5rem' }}>{new Date(e.expenditureDate).toLocaleString()}</td>
                                    <td style={{ padding: '0.5rem' }}>{e.reason}</td>
                                    <td style={{ padding: '0.5rem' }}>{e.recordedByUsername}</td>
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
        </div>
    );
};

export default Expenditures;
