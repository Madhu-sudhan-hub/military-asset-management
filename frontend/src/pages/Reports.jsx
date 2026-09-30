import React, { useState } from 'react';
import ReportViewer from '../components/ReportViewer';
import { reportService } from '../services/reportService';
import { 
    FileText, 
    ShoppingCart, 
    ArrowRightLeft, 
    ClipboardList, 
    Banknote, 
    Package, 
    ShieldAlert 
} from 'lucide-react';

const Reports = () => {
    const [activeReport, setActiveReport] = useState(null);

    const reportConfigs = [
        {
            id: 'inventory',
            title: 'Inventory Report',
            icon: <Package size={24} />,
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
            icon: <ShoppingCart size={24} />,
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
            icon: <ArrowRightLeft size={24} />,
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
            icon: <ClipboardList size={24} />,
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
            icon: <Banknote size={24} />,
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
            id: 'audit',
            title: 'Audit Activity',
            icon: <ShieldAlert size={24} />,
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            <div className="report-types-grid" style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '16px'
            }}>
                {reportConfigs.map(config => {
                    const isActive = activeReport === config.id;
                    return (
                        <div 
                            key={config.id} 
                            onClick={() => setActiveReport(config.id)}
                            className="card clickable"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '24px 16px',
                                gap: '12px',
                                background: isActive ? 'var(--primary-navy)' : 'white',
                                color: isActive ? 'white' : 'var(--text-main)',
                                borderColor: isActive ? 'var(--primary-navy)' : 'var(--border-color)',
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            <div style={{ 
                                color: isActive ? 'var(--accent-green)' : 'var(--text-secondary)'
                            }}>
                                {config.icon}
                            </div>
                            <h4 style={{ 
                                margin: 0, 
                                fontSize: '14px', 
                                color: isActive ? 'white' : 'var(--text-main)' 
                            }}>
                                {config.title}
                            </h4>
                        </div>
                    );
                })}
            </div>

            {currentConfig && (
                <div className="report-viewer-wrapper" style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
                    <h3 className="section-title" style={{ marginTop: '16px' }}>{currentConfig.title}</h3>
                    <ReportViewer {...currentConfig} />
                </div>
            )}
        </div>
    );
};

export default Reports;
