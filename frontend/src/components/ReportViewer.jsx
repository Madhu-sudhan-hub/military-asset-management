import React, { useState, useEffect } from 'react';
import { reportService } from '../services/reportService';
import { Download, Filter, Search, FileX, ChevronLeft, ChevronRight } from 'lucide-react';

const ReportViewer = ({ title, columns, fetchFn, exportCsvFn, exportExcelFn, filterFields }) => {
    const [data, setData] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [exportError, setExportError] = useState('');

    const [filters, setFilters] = useState({});

    useEffect(() => {
        loadData(filters, page);
    }, [page]);

    const loadData = async (currentFilters, currentPage) => {
        setLoading(true);
        setError('');
        try {
            const params = { page: currentPage, size: 20 };
            Object.keys(currentFilters).forEach(k => {
                if (currentFilters[k]) params[k] = currentFilters[k];
            });

            if (params.startDate) params.startDate += 'T00:00:00';
            if (params.endDate) params.endDate += 'T23:59:59';

            const res = await fetchFn(params);
            setData(res.content || []);
            setTotalPages(res.totalPages || 0);
        } catch (err) {
            setError('Unable to load the report. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const applyFilters = () => {
        setPage(0);
        loadData(filters, 0);
    };

    const resetFilters = () => {
        setFilters({});
        setPage(0);
        loadData({}, 0);
    };

    const handleExport = async (format) => {
        setExportError('');
        try {
            const params = { ...filters };
            if (params.startDate) params.startDate += 'T00:00:00';
            if (params.endDate) params.endDate += 'T23:59:59';

            let response;
            if (format === 'csv' && exportCsvFn) {
                response = await exportCsvFn('csv', params);
                reportService.downloadBlob(response.data, `${title.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`);
            } else if (format === 'excel' && exportExcelFn) {
                response = await exportExcelFn('excel', params);
                reportService.downloadBlob(response.data, `${title.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.xlsx`);
            }
        } catch (e) {
            setExportError('Unable to generate the report file. Please try again.');
        }
    };

    return (
        <div className="report-viewer">
            {filterFields && filterFields.length > 0 && (
                <div className="filter-card card" style={{ marginBottom: '24px' }}>
                    <div className="filter-header">
                        <h3><Filter size={18} /> Report Filters</h3>
                    </div>
                    <div className="filter-grid">
                        {filterFields.map(f => (
                            <div className="form-group" key={f.name}>
                                <label>{f.label}</label>
                                {f.type === 'select' ? (
                                    <select name={f.name} value={filters[f.name] || ''} onChange={handleFilterChange} className="form-control">
                                        <option value="">All</option>
                                        {f.options?.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </select>
                                ) : (
                                    <div className="input-with-icon">
                                        {f.name === 'search' && <Search size={16} className="search-icon" style={{ position: 'absolute', left: '10px', top: '10px', color: '#94a3b8' }} />}
                                        <input 
                                            type={f.type || 'text'} 
                                            name={f.name} 
                                            value={filters[f.name] || ''} 
                                            onChange={handleFilterChange} 
                                            className="form-control" 
                                            placeholder={f.placeholder}
                                            style={f.name === 'search' ? { paddingLeft: '32px' } : {}}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                        <div className="filter-actions" style={{ gap: '12px' }}>
                            <button onClick={resetFilters} className="btn-secondary">Reset</button>
                            <button onClick={applyFilters} className="btn-primary">Apply Filters</button>
                        </div>
                    </div>
                </div>
            )}

            <div className="page-actions">
                <div style={{ display: 'flex', gap: '12px' }}>
                    {exportCsvFn && (
                        <button onClick={() => handleExport('csv')} className="btn-secondary">
                            <Download size={16} /> Export CSV
                        </button>
                    )}
                    {exportExcelFn && (
                        <button onClick={() => handleExport('excel')} className="btn-secondary">
                            <Download size={16} /> Export Excel
                        </button>
                    )}
                </div>
            </div>

            {error && <div className="alert error">{error}</div>}
            {exportError && <div className="alert error">{exportError}</div>}

            <div className="table-container">
                {loading ? (
                    <div className="loading-container" style={{ minHeight: '300px' }}>
                        <div className="spinner"></div>
                        <span>Loading report data...</span>
                    </div>
                ) : data.length === 0 ? (
                    <div className="empty-state" style={{ border: 'none' }}>
                        <div className="empty-icon">
                            <FileX size={32} />
                        </div>
                        <h3>No records found</h3>
                        <p>No data matches your current filter criteria.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    {columns.map((col, idx) => (
                                        <th key={idx}>{col.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {data.map((row, rIdx) => (
                                    <tr key={rIdx}>
                                        {columns.map((col, cIdx) => (
                                            <td key={cIdx}>{col.render ? col.render(row) : row[col.key]}</td>
                                        ))}
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
                            disabled={page === totalPages - 1}
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

export default ReportViewer;
