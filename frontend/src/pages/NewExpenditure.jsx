import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { expenditureService } from '../services/expenditureService';
import { baseService, assetService, equipmentTypeService } from '../services/dataService';
import { AuthContext } from '../context/AuthContext';

const NewExpenditure = () => {
    const { role, baseId: userBaseId } = useContext(AuthContext);
    const navigate = useNavigate();

    const [bases, setBases] = useState([]);
    const [equipmentTypes, setEquipmentTypes] = useState([]);
    const [assets, setAssets] = useState([]);
    
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        baseId: role === 'ADMIN' ? '' : userBaseId,
        equipmentTypeId: '',
        expenditureType: 'BULK', // BULK or INDIVIDUAL
        assetId: '',
        quantity: 1,
        expenditureDate: new Date().toISOString().split('T')[0] + 'T00:00',
        reason: '',
        referenceNumber: ''
    });

    useEffect(() => {
        loadDropdowns();
    }, []);

    useEffect(() => {
        if (formData.expenditureType === 'INDIVIDUAL' && formData.baseId && formData.equipmentTypeId) {
            loadAssets(formData.baseId, formData.equipmentTypeId);
        } else {
            setAssets([]);
        }
    }, [formData.expenditureType, formData.baseId, formData.equipmentTypeId]);

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

    const loadAssets = async (bId, eqId) => {
        try {
            const res = await assetService.getAssetsByBaseAndEquipment(bId, eqId);
            setAssets(res.content || []);
        } catch (err) {
            console.error("Failed to load assets");
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.expenditureType === 'INDIVIDUAL' && !formData.assetId) {
            setError("Please select an Asset.");
            return;
        }

        if (!window.confirm("Are you sure you want to record this expenditure? This will permanently reduce inventory.")) {
            return;
        }

        setSaving(true);
        try {
            const payload = {
                baseId: parseInt(formData.baseId),
                equipmentTypeId: parseInt(formData.equipmentTypeId),
                quantity: formData.expenditureType === 'INDIVIDUAL' ? 1 : parseInt(formData.quantity),
                assetId: formData.expenditureType === 'INDIVIDUAL' ? parseInt(formData.assetId) : null,
                expenditureDate: formData.expenditureDate,
                reason: formData.reason,
                referenceNumber: formData.referenceNumber
            };

            await expenditureService.createExpenditure(payload);
            navigate('/expenditures');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to record expenditure.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-content">
            <div className="page-header" style={{ marginBottom: '1.5rem' }}>
                <h2>Record Expenditure</h2>
            </div>

            <div className="auth-card register-card" style={{ maxWidth: '600px', margin: '0 auto', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                {error && <div className="alert error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    
                    <div className="form-group">
                        <label>Base</label>
                        <select name="baseId" value={formData.baseId} onChange={handleChange} required disabled={role !== 'ADMIN'}>
                            <option value="">Select Base</option>
                            {bases.map(b => <option key={b.baseId} value={b.baseId}>{b.baseName}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Equipment Type</label>
                        <select name="equipmentTypeId" value={formData.equipmentTypeId} onChange={handleChange} required>
                            <option value="">Select Equipment</option>
                            {equipmentTypes.map(e => <option key={e.equipmentTypeId} value={e.equipmentTypeId}>{e.equipmentName}</option>)}
                        </select>
                    </div>

                    <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label>Expenditure Type</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <label>
                                <input type="radio" name="expenditureType" value="BULK" checked={formData.expenditureType === 'BULK'} onChange={handleChange} /> Bulk
                            </label>
                            <label>
                                <input type="radio" name="expenditureType" value="INDIVIDUAL" checked={formData.expenditureType === 'INDIVIDUAL'} onChange={handleChange} /> Individual Asset
                            </label>
                        </div>
                    </div>

                    {formData.expenditureType === 'BULK' ? (
                        <div className="form-group">
                            <label>Quantity</label>
                            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} min="1" required />
                        </div>
                    ) : (
                        <div className="form-group">
                            <label>Asset</label>
                            <select name="assetId" value={formData.assetId} onChange={handleChange} required>
                                <option value="">{assets.length === 0 ? 'No assets found' : 'Select Asset'}</option>
                                {assets.map(a => <option key={a.assetId} value={a.assetId}>{a.assetTag} (SN: {a.serialNumber})</option>)}
                            </select>
                        </div>
                    )}

                    <div className="form-group">
                        <label>Reference Number</label>
                        <input type="text" name="referenceNumber" value={formData.referenceNumber} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>Expenditure Date</label>
                        <input type="datetime-local" name="expenditureDate" value={formData.expenditureDate} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>Reason</label>
                        <textarea name="reason" value={formData.reason} onChange={handleChange} rows="3" required></textarea>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                        <button type="button" onClick={() => navigate('/expenditures')} disabled={saving}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Record Expenditure'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewExpenditure;
