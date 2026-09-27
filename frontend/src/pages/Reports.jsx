import React, { useState } from 'react';
import ReportViewer from '../components/ReportViewer';
import { reportService } from '../services/reportService';

const Reports = () => {
    const [activeReport, setActiveReport] = useState(null);

    const reportConfigs = [
        {
            id: 'inventory',
            title: 'Inventory Report',
            fetchFn: reportService.getInventoryReport,
            exportCsvFn: reportService.exportInventory,
            exportExcelFn: reportService.exportInventory,
            filterFields: [
                { name: 'startDate', label: 'Start Date', type: 'date' },
                { name: 'endDate', label: 'End Date', type: 'date' },
                { name: 'baseId', label: 'Base ID', type: 'number' },
                { name: 'equipmentTypeId', label: 'Eq. Type ID', type: 'number' }
            ],
            columns: [
                { label: 'Base', key: 'baseName' },
                { label: 'Equipment Type', key: 'equipmentName' },
                { label: 'Opening Balance', key: 'openingBalance' },
                { label: 'Purchases', key: 'purchases' },
                { label: 'Transfer In', key: 'transferIn' },
                { label: 'Transfer Out', key: 'transferOut' },
                { label: 'Net Movement', key: 'netMovement' },
                { label: 'Expenditure', key: 'expenditure' },
                { label: 'Closing Balance', key: 'closingBalance' },
                { label: 'Assigned', key: 'assigned' }
            ]
        },
        {
            id: 'purchases',
            title: 'Purchase Report',
            fetchFn: reportService.getPurchaseReport,
            exportCsvFn: reportService.exportPurchases,
            exportExcelFn: reportService.exportPurchases,
            filterFields: [
                { name: 'startDate', label: 'Start Date', type: 'date' },
                { name: 'endDate', label: 'End Date', type: 'date' },
                { name: 'baseId', label: 'Base ID', type: 'number' },
                { name: 'equipmentTypeId', label: 'Eq. Type ID', type: 'number' },
                { name: 'supplier', label: 'Supplier' },
                { name: 'referenceNumber', label: 'Reference Number' }
            ],
            columns: [
                { label: 'ID', key: 'purchaseId' },
                { label: 'Date', key: 'purchaseDate' },
                { label: 'Base', render: (row) => row.base?.baseName },
                { label: 'Equipment', render: (row) => row.equipmentType?.equipmentName },
                { label: 'Quantity', key: 'quantity' },
                { label: 'Supplier', key: 'supplier' },
                { label: 'Reference', key: 'referenceNumber' },
                { label: 'Unit Cost', key: 'unitCost' },
                { label: 'Total Cost', key: 'totalCost' },
                { label: 'Created By', key: 'createdByUsername' }
            ]
        },
        {
            id: 'transfers',
            title: 'Transfer Report',
            fetchFn: reportService.getTransferReport,
            exportCsvFn: reportService.exportTransfers,
            exportExcelFn: reportService.exportTransfers,
            filterFields: [
                { name: 'startDate', label: 'Start Date', type: 'date' },
                { name: 'endDate', label: 'End Date', type: 'date' },
                { name: 'fromBaseId', label: 'From Base ID', type: 'number' },
                { name: 'toBaseId', label: 'To Base ID', type: 'number' },
                { name: 'status', label: 'Status' }
            ],
            columns: [
                { label: 'ID', key: 'transferId' },
                { label: 'Reference', key: 'referenceNumber' },
                { label: 'From Base', render: (row) => row.fromBase?.baseName },
                { label: 'To Base', render: (row) => row.toBase?.baseName },
                { label: 'Date', key: 'transferDate' },
                { label: 'Status', key: 'status' },
                { label: 'Initiator', key: 'initiatedByUsername' }
            ]
        },
        {
            id: 'assignments',
            title: 'Assignment Report',
            fetchFn: reportService.getAssignmentReport,
            exportCsvFn: reportService.exportAssignments,
            exportExcelFn: reportService.exportAssignments,
            filterFields: [
                { name: 'startDate', label: 'Start Date', type: 'date' },
                { name: 'endDate', label: 'End Date', type: 'date' },
                { name: 'baseId', label: 'Base ID', type: 'number' },
                { name: 'personnelId', label: 'Personnel ID', type: 'number' },
                { name: 'assetId', label: 'Asset ID', type: 'number' },
                { name: 'status', label: 'Status' }
            ],
            columns: [
                { label: 'ID', key: 'assignmentId' },
                { label: 'Asset Tag', render: (row) => row.asset?.assetTag },
                { label: 'Personnel', render: (row) => row.personnel?.fullName },
                { label: 'Assigned Date', key: 'assignedDate' },
                { label: 'Returned Date', key: 'returnedDate' },
                { label: 'Status', key: 'status' }
            ]
        },
        {
            id: 'expenditures',
            title: 'Expenditure Report',
            fetchFn: reportService.getExpenditureReport,
            exportCsvFn: reportService.exportExpenditures,
            exportExcelFn: reportService.exportExpenditures,
            filterFields: [
                { name: 'startDate', label: 'Start Date', type: 'date' },
                { name: 'endDate', label: 'End Date', type: 'date' },
                { name: 'baseId', label: 'Base ID', type: 'number' },
                { name: 'equipmentTypeId', label: 'Eq. Type ID', type: 'number' },
                { name: 'assetId', label: 'Asset ID', type: 'number' }
            ],
            columns: [
                { label: 'ID', key: 'expenditureId' },
                { label: 'Base', render: (row) => row.base?.baseName },
                { label: 'Equipment', render: (row) => row.equipmentType?.equipmentName },
                { label: 'Asset', render: (row) => row.asset?.assetTag },
                { label: 'Quantity', key: 'quantity' },
                { label: 'Date', key: 'expenditureDate' },
                { label: 'Reason', key: 'reason' },
                { label: 'Reference', key: 'referenceNumber' }
            ]
        },
        {
            id: 'assets',
            title: 'Asset Report',
            fetchFn: reportService.getAssetReport,
            exportCsvFn: reportService.exportAssets,
            filterFields: [
                { name: 'baseId', label: 'Base ID', type: 'number' },
                { name: 'equipmentTypeId', label: 'Eq. Type ID', type: 'number' },
                { name: 'status', label: 'Status' },
                { name: 'search', label: 'Search (Tag/Serial)' }
            ],
            columns: [
                { label: 'ID', key: 'assetId' },
                { label: 'Asset Tag', key: 'assetTag' },
                { label: 'Serial Number', key: 'serialNumber' },
                { label: 'Equipment', render: (row) => row.equipmentType?.equipmentName },
                { label: 'Current Base', render: (row) => row.currentBase?.baseName },
                { label: 'Status', key: 'status' },
                { label: 'Acquisition Date', key: 'acquisitionDate' }
            ]
        },
        {
            id: 'audit',
            title: 'Audit Activity Report',
            fetchFn: reportService.getAuditReport,
            exportCsvFn: reportService.exportAuditActivity,
            filterFields: [
                { name: 'startDate', label: 'Start Date', type: 'date' },
                { name: 'endDate', label: 'End Date', type: 'date' },
                { name: 'userId', label: 'User ID', type: 'number' },
                { name: 'action', label: 'Action' },
                { name: 'entityType', label: 'Entity Type' },
                { name: 'entityId', label: 'Entity ID', type: 'number' }
            ],
            columns: [
                { label: 'ID', key: 'auditLogId' },
                { label: 'Timestamp', render: (row) => new Date(row.createdAt).toLocaleString() },
                { label: 'User', render: (row) => row.username || 'System' },
                { label: 'Action', key: 'action' },
                { label: 'Entity Type', key: 'entityType' },
                { label: 'Entity ID', key: 'entityId' },
                { label: 'IP Address', key: 'ipAddress' }
            ]
        }
    ];

    const currentConfig = reportConfigs.find(c => c.id === activeReport);

    return (
        <div className="page-content">
            <div className="page-header">
                <h2>Reports</h2>
            </div>
            
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                {reportConfigs.map(config => (
                    <div 
                        key={config.id} 
                        onClick={() => setActiveReport(config.id)}
                        style={{
                            padding: '1.5rem',
                            background: activeReport === config.id ? '#007bff' : '#fff',
                            color: activeReport === config.id ? '#fff' : '#333',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            minWidth: '200px',
                            textAlign: 'center',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            transition: 'all 0.2s ease-in-out'
                        }}
                    >
                        <h4 style={{ margin: 0 }}>{config.title}</h4>
                    </div>
                ))}
            </div>

            {currentConfig && (
                <div style={{ borderTop: '2px solid #eee', paddingTop: '1rem' }}>
                    <ReportViewer {...currentConfig} />
                </div>
            )}
        </div>
    );
};

export default Reports;
