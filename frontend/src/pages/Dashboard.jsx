import React, { useState, useEffect, useContext } from 'react';
import { dashboardService } from '../services/dashboardService';
import { baseService, equipmentTypeService } from '../services/dataService';
import { AuthContext } from '../context/AuthContext';
import { 
    PackageOpen, 
    ShoppingCart, 
    ArrowRightLeft, 
    LogOut, 
    Banknote, 
    Package, 
    UserCheck,
    Filter,
    Calendar,
    Search,
    X
} from 'lucide-react';
import './Dashboard.css'; // Let's put some specific styles here if needed

const KPI = ({ title, value, icon, iconColor, onClick }) => (
    <div className={`kpi-card ${onClick ? 'clickable' : ''}`} onClick={onClick}>
        <div className="kpi-icon-wrapper" style={{ background: `${iconColor}15`, color: iconColor }}>
            {icon}
        </div>
        <div className="kpi-content">
            <h4 className="kpi-title">{title}</h4>
            <div className="kpi-value">{value}</div>
        </div>
    </div>
);

const Dashboard = () => {
    const { role, baseId: userBaseId } = useContext(AuthContext);

    const [summary, setSummary] = useState(null);
    const [bases, setBases] = useState([]);
    const [equipmentTypes, setEquipmentTypes] = useState([]);
    
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [showNetMovementDetails, setShowNetMovementDetails] = useState(false);

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
               summary.closingBalance === 0 &&
               summary.assigned === 0;
    };

    return (
        <div className="dashboard-container">
            <div className="filter-card card">
                <div className="filter-header">
                    <h3><Filter size={18} /> Inventory Filters</h3>
                </div>
                <div className="filter-grid">
                    <div className="form-group">
                        <label>Start Date</label>
                        <div className="input-with-icon">
                            <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="form-control" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>End Date</label>
                        <div className="input-with-icon">
                            <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="form-control" />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Base Location</label>
                        <select name="baseId" value={filters.baseId} onChange={handleFilterChange} className="form-control" disabled={role !== 'ADMIN'}>
                            <option value="">All Bases</option>
                            {bases.map(b => <option key={b.baseId} value={b.baseId}>{b.baseName}</option>)}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Equipment Type</label>
                        <select name="equipmentTypeId" value={filters.equipmentTypeId} onChange={handleFilterChange} className="form-control">
                            <option value="">All Equipment</option>
                            {equipmentTypes.map(e => <option key={e.equipmentTypeId} value={e.equipmentTypeId}>{e.equipmentName}</option>)}
                        </select>
                    </div>
                    <div className="filter-actions">
                        <button onClick={handleReset} className="btn-secondary">Reset</button>
                    </div>
                </div>
            </div>

            {error ? (
                <div className="alert error">
                    {error} <button onClick={loadDashboard} className="btn-secondary" style={{ marginLeft: 'auto', padding: '4px 12px' }}>Retry</button>
                </div>
            ) : loading ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <span>Loading dashboard data...</span>
                </div>
            ) : isAllZeros() ? (
                <div className="empty-state">
                    <div className="empty-icon">
                        <Package size={32} />
                    </div>
                    <h3>No inventory movement found</h3>
                    <p>Try adjusting the selected date range, base location, or equipment type filters above.</p>
                </div>
            ) : (
                <>
                    <h3 className="section-title">Inventory Overview</h3>
                    <div className="kpi-grid">
                        <KPI 
                            title="Opening Balance" 
                            value={summary.openingBalance} 
                            icon={<PackageOpen size={24} />} 
                            iconColor="var(--primary-navy)" 
                        />
                        <KPI 
                            title="Closing Balance" 
                            value={summary.closingBalance} 
                            icon={<Package size={24} />} 
                            iconColor="var(--military-green)" 
                        />
                        <KPI 
                            title="Net Movement" 
                            value={(summary.netMovement > 0 ? '+' : '') + summary.netMovement} 
                            icon={<ArrowRightLeft size={24} />} 
                            iconColor={summary.netMovement >= 0 ? "var(--accent-green)" : "var(--danger)"} 
                            onClick={() => setShowNetMovementDetails(true)}
                        />
                        <KPI 
                            title="Currently Assigned" 
                            value={summary.assigned} 
                            icon={<UserCheck size={24} />} 
                            iconColor="#0284c7" 
                        />
                        <KPI 
                            title="Total Expended" 
                            value={summary.expenditure} 
                            icon={<LogOut size={24} />} 
                            iconColor="var(--warning)" 
                        />
                    </div>

                    <h3 className="section-title mt-8">Movement Breakdown</h3>
                    <div className="kpi-grid">
                        <KPI 
                            title="New Purchases" 
                            value={'+' + summary.purchases} 
                            icon={<ShoppingCart size={24} />} 
                            iconColor="var(--accent-green)" 
                        />
                        <KPI 
                            title="Transfers In" 
                            value={'+' + summary.transferIn} 
                            icon={<ArrowRightLeft size={24} />} 
                            iconColor="#0ea5e9" 
                        />
                        <KPI 
                            title="Transfers Out" 
                            value={'-' + summary.transferOut} 
                            icon={<LogOut size={24} />} 
                            iconColor="var(--danger)" 
                        />
                    </div>
                </>
            )}

            {showNetMovementDetails && summary && (
                <div className="modal-overlay" onClick={() => setShowNetMovementDetails(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Net Movement Details</h2>
                            <button className="close-btn" onClick={() => setShowNetMovementDetails(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="movement-details">
                                <div className="movement-row">
                                    <div className="movement-label">
                                        <div className="movement-dot bg-green"></div>
                                        <span>Purchases</span>
                                    </div>
                                    <span className="movement-val positive">+{summary.purchases}</span>
                                </div>
                                <div className="movement-row">
                                    <div className="movement-label">
                                        <div className="movement-dot bg-blue"></div>
                                        <span>Transfer In</span>
                                    </div>
                                    <span className="movement-val positive">+{summary.transferIn}</span>
                                </div>
                                <div className="movement-row">
                                    <div className="movement-label">
                                        <div className="movement-dot bg-red"></div>
                                        <span>Transfer Out</span>
                                    </div>
                                    <span className="movement-val negative">-{summary.transferOut}</span>
                                </div>
                                
                                <div className="movement-divider"></div>
                                
                                <div className="movement-row total">
                                    <span>Total Net Movement</span>
                                    <span className={summary.netMovement >= 0 ? "positive" : "negative"}>
                                        {summary.netMovement > 0 ? '+' : ''}{summary.netMovement}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button onClick={() => setShowNetMovementDetails(false)} className="btn-primary">Acknowledge</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
