import React, { useState, useEffect } from 'react';
import { reportService } from '../services/reportService';

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
        <div className="report-viewer" style={{ marginTop: '2rem' }}>
            <h3>{title}</h3>
            
            {filterFields && filterFields.length > 0 && (
                <div className="filters" style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px', alignItems: 'flex-end' }}>
                    {filterFields.map(f => (
                        <div key={f.name}>
                            <label style={{ display: 'block', fontSize: '0.8rem', color: '#6c757d', marginBottom: '0.2rem' }}>{f.label}</label>
                            {f.type === 'select' ? (
                                <select name={f.name} value={filters[f.name] || ''} onChange={handleFilterChange} className="form-control">
                                    <option value="">All</option>
                                    {f.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                </select>
                            ) : (
                                <input type={f.type || 'text'} name={f.name} value={filters[f.name] || ''} onChange={handleFilterChange} className="form-control" placeholder={f.placeholder} />
                            )}
                        </div>
                    ))}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button onClick={applyFilters} className="btn-primary" style={{ padding: '0.5rem 1rem' }}>Apply Filters</button>
                        <button onClick={resetFilters} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}>Reset</button>
                    </div>
                </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                {exportCsvFn && <button onClick={() => handleExport('csv')} className="btn-secondary">Export CSV</button>}
                {exportExcelFn && <button onClick={() => handleExport('excel')} className="btn-secondary">Export Excel</button>}
            </div>

            {error && <div className="alert error">{error}</div>}
            {exportError && <div className="alert error">{exportError}</div>}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <h4>Loading...</h4>
                </div>
            ) : data.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem', background: '#f8f9fa', borderRadius: '8px' }}>
                    <p style={{ color: '#6c757d' }}>No records found for the selected filters.</p>
                </div>
            ) : (
                <div className="table-responsive">
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

            {!loading && totalPages > 1 && (
                <div className="pagination" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
                    <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Previous</button>
                    <span>Page {page + 1} of {totalPages}</span>
                    <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}>Next</button>
                </div>
            )}
        </div>
    );
};

export default ReportViewer;
