import React, { useState, useEffect, useContext } from 'react';
import { dashboardService } from '../services/dashboardService';
import { baseService, equipmentTypeService } from '../services/dataService';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
    const { role, baseId: userBaseId } = useContext(AuthContext);

    const [summary, setSummary] = useState(null);
    const [bases, setBases] = useState([]);
    const [equipmentTypes, setEquipmentTypes] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [showNetMovementDetails, setShowNetMovementDetails] = useState(false);

    // Default to first day of current month to today
    const defaultStart = new Date();
    defaultStart.setDate(1);
    const [filters, setFilters] = useState({
        startDate: defaultStart.toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
        baseId: role === 'ADMIN' ? '' : userBaseId,
        equipmentTypeId: ''
    });

    useEffect(() => {
        loadDropdowns();
    }, []);

    useEffect(() => {
        loadDashboard();
    }, [filters]);

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

    const loadDashboard = async () => {
        setLoading(true);
        setError('');
        try {
            const params = { ...filters };
            Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
            const data = await dashboardService.getDashboardSummary(params);
            setSummary(data);
        } catch (err) {
            setError('Unable to load dashboard data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const handleReset = () => {
        setFilters({
            startDate: defaultStart.toISOString().split('T')[0],
            endDate: new Date().toISOString().split('T')[0],
            baseId: role === 'ADMIN' ? '' : userBaseId,
            equipmentTypeId: ''
        });
    };

    const isAllZeros = () => {
        if (!summary) return true;
        return summary.openingBalance === 0 && 
               summary.purchases === 0 && 
               summary.transferIn === 0 && 
               summary.transferOut === 0 && 
               summary.expenditure === 0 && 
               summary.closingBalance === 0;
    };

    return (
        <div className="page-content">
            <div className="page-header" style={{ marginBottom: '1rem' }}>
                <h2>Dashboard</h2>
            </div>

            <div className="filters dashboard-filters" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap', alignItems: 'center', background: '#f8f9fa', padding: '1rem', borderRadius: '8px' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#6c757d' }}>Start Date</label>
                    <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="form-control" />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#6c757d' }}>End Date</label>
                    <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="form-control" />
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#6c757d' }}>Base</label>
                    <select name="baseId" value={filters.baseId} onChange={handleFilterChange} className="form-control" disabled={role !== 'ADMIN'}>
                        <option value="">All Bases</option>
                        {bases.map(b => <option key={b.baseId} value={b.baseId}>{b.baseName}</option>)}
                    </select>
                </div>
                <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: '#6c757d' }}>Equipment</label>
                    <select name="equipmentTypeId" value={filters.equipmentTypeId} onChange={handleFilterChange} className="form-control">
                        <option value="">All Equipment</option>
                        {equipmentTypes.map(e => <option key={e.equipmentTypeId} value={e.equipmentTypeId}>{e.equipmentName}</option>)}
                    </select>
                </div>
                <div style={{ marginTop: 'auto' }}>
                    <button onClick={handleReset} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>Reset</button>
                </div>
            </div>

            {error ? (
                <div className="alert error">
                    {error} <button onClick={loadDashboard} style={{ marginLeft: '1rem' }}>Retry</button>
                </div>
            ) : loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <h3>Loading Dashboard...</h3>
                </div>
            ) : isAllZeros() ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: '#f8f9fa', borderRadius: '8px' }}>
                    <h3 style={{ color: '#6c757d' }}>No inventory movement found for the selected filters.</h3>
                </div>
            ) : (
                <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                    
                    <div className="stat-card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '4px solid #6c757d' }}>
                        <h4 style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem', textTransform: 'uppercase' }}>Opening Balance</h4>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{summary.openingBalance}</div>
                    </div>

                    <div className="stat-card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '4px solid #28a745' }}>
                        <h4 style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem', textTransform: 'uppercase' }}>Purchases</h4>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>+{summary.purchases}</div>
                    </div>

                    <div className="stat-card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '4px solid #17a2b8' }}>
                        <h4 style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem', textTransform: 'uppercase' }}>Transfer In</h4>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>+{summary.transferIn}</div>
                    </div>

                    <div className="stat-card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '4px solid #ffc107' }}>
                        <h4 style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem', textTransform: 'uppercase' }}>Transfer Out</h4>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>-{summary.transferOut}</div>
                    </div>

                    <div className="stat-card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '4px solid #007bff', cursor: 'pointer' }} onClick={() => setShowNetMovementDetails(true)}>
                        <h4 style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem', textTransform: 'uppercase' }}>Net Movement <small>(Click)</small></h4>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem', color: summary.netMovement >= 0 ? '#28a745' : '#dc3545' }}>
                            {summary.netMovement > 0 ? '+' : ''}{summary.netMovement}
                        </div>
                    </div>

                    <div className="stat-card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '4px solid #dc3545' }}>
                        <h4 style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem', textTransform: 'uppercase' }}>Expenditure</h4>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>-{summary.expenditure}</div>
                    </div>

                    <div className="stat-card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '4px solid #343a40' }}>
                        <h4 style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem', textTransform: 'uppercase' }}>Closing Balance</h4>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{summary.closingBalance}</div>
                    </div>

                    <div className="stat-card" style={{ background: '#fff', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: '4px solid #6f42c1' }}>
                        <h4 style={{ margin: 0, color: '#6c757d', fontSize: '0.9rem', textTransform: 'uppercase' }}>Assigned</h4>
                        <div style={{ fontSize: '2rem', fontWeight: 'bold', marginTop: '0.5rem' }}>{summary.assigned}</div>
                    </div>
                </div>
            )}

            {showNetMovementDetails && summary && (
                <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="modal-content" style={{ background: '#fff', padding: '2rem', borderRadius: '8px', width: '100%', maxWidth: '400px' }}>
                        <h3 style={{ marginTop: 0 }}>Net Movement Details</h3>
                        <div style={{ margin: '1.5rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Purchases</span>
                                <span style={{ color: '#28a745' }}>+{summary.purchases}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Transfer In</span>
                                <span style={{ color: '#28a745' }}>+{summary.transferIn}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>Transfer Out</span>
                                <span style={{ color: '#dc3545' }}>-{summary.transferOut}</span>
                            </div>
                            <hr style={{ width: '100%', border: 'none', borderTop: '1px solid #ccc' }} />
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}>
                                <span>Net Movement</span>
                                <span style={{ color: summary.netMovement >= 0 ? '#28a745' : '#dc3545' }}>
                                    {summary.netMovement > 0 ? '+' : ''}{summary.netMovement}
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <button onClick={() => setShowNetMovementDetails(false)} className="btn-primary">Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
