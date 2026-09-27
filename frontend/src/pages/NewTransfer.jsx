import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { transferService } from '../services/transferService';
import { baseService, equipmentTypeService, assetService } from '../services/dataService';
import { AuthContext } from '../context/AuthContext';

const NewTransfer = () => {
    const { role, baseId: userBaseId } = useContext(AuthContext);
    const navigate = useNavigate();

    const [bases, setBases] = useState([]);
    const [equipmentTypes, setEquipmentTypes] = useState([]);
    const [assets, setAssets] = useState([]);
    
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        fromBaseId: role === 'ADMIN' ? '' : userBaseId,
        toBaseId: '',
        transferDate: new Date().toISOString().split('T')[0] + 'T00:00',
        referenceNumber: '',
        transferType: 'BULK', // BULK or INDIVIDUAL
        equipmentTypeId: '',
        quantity: 1,
        assetId: ''
    });

    useEffect(() => {
        loadDropdowns();
    }, []);

    useEffect(() => {
        if (formData.transferType === 'INDIVIDUAL' && formData.fromBaseId && formData.equipmentTypeId) {
            loadAssets();
        } else {
            setAssets([]);
        }
    }, [formData.transferType, formData.fromBaseId, formData.equipmentTypeId]);

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

    const loadAssets = async () => {
        try {
            const res = await assetService.getAssetsByBaseAndEquipment(formData.fromBaseId, formData.equipmentTypeId);
            setAssets(res.content || []);
        } catch (err) {
            console.error("Failed to load assets", err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const validateForm = () => {
        if (formData.fromBaseId === formData.toBaseId) {
            setError('Source and Destination bases must be different.');
            return false;
        }
        if (formData.transferType === 'BULK' && formData.quantity <= 0) {
            setError('Quantity must be greater than zero for bulk transfers.');
            return false;
        }
        if (formData.transferType === 'INDIVIDUAL' && !formData.assetId) {
            setError('Please select an asset for individual transfer.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!validateForm()) return;

        setSaving(true);
        try {
            const payload = {
                fromBaseId: parseInt(formData.fromBaseId),
                toBaseId: parseInt(formData.toBaseId),
                transferDate: formData.transferDate,
                referenceNumber: formData.referenceNumber,
                items: [
                    {
                        equipmentTypeId: parseInt(formData.equipmentTypeId),
                        assetId: formData.transferType === 'INDIVIDUAL' ? parseInt(formData.assetId) : null,
                        quantity: formData.transferType === 'INDIVIDUAL' ? 1 : parseInt(formData.quantity)
                    }
                ]
            };

            await transferService.createTransfer(payload);
            navigate('/transfers');
        } catch (err) {
            if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else if (err.response?.data?.error === 'VALIDATION_ERROR') {
                setError('Please check your inputs.');
            } else {
                setError('Failed to create transfer.');
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-content">
            <div className="page-header" style={{ marginBottom: '1.5rem' }}>
                <h2>New Equipment Transfer</h2>
            </div>

            <div className="auth-card register-card" style={{ maxWidth: '600px', margin: '0 auto', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                {error && <div className="alert error">{error}</div>}
                <form onSubmit={handleSubmit}>
                    
                    <div className="form-group">
                        <label>Reference Number</label>
                        <input type="text" name="referenceNumber" value={formData.referenceNumber} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>Transfer Date</label>
                        <input type="datetime-local" name="transferDate" value={formData.transferDate} onChange={handleChange} required />
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>From Base</label>
                            <select name="fromBaseId" value={formData.fromBaseId} onChange={handleChange} required disabled={role !== 'ADMIN'}>
                                <option value="">Select Base</option>
                                {bases.map(b => <option key={b.baseId} value={b.baseId}>{b.baseName}</option>)}
                            </select>
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>To Base</label>
                            <select name="toBaseId" value={formData.toBaseId} onChange={handleChange} required>
                                <option value="">Select Base</option>
                                {bases.map(b => <option key={b.baseId} value={b.baseId}>{b.baseName}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Equipment Type</label>
                        <select name="equipmentTypeId" value={formData.equipmentTypeId} onChange={handleChange} required>
                            <option value="">Select Equipment</option>
                            {equipmentTypes.map(e => <option key={e.equipmentTypeId} value={e.equipmentTypeId}>{e.equipmentName}</option>)}
                        </select>
                    </div>

                    <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label>Transfer Type</label>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <label>
                                <input type="radio" name="transferType" value="BULK" checked={formData.transferType === 'BULK'} onChange={handleChange} /> Bulk
                            </label>
                            <label>
                                <input type="radio" name="transferType" value="INDIVIDUAL" checked={formData.transferType === 'INDIVIDUAL'} onChange={handleChange} /> Individual Asset
                            </label>
                        </div>
                    </div>

                    {formData.transferType === 'BULK' ? (
                        <div className="form-group">
                            <label>Quantity</label>
                            <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} min="1" required />
                        </div>
                    ) : (
                        <div className="form-group">
                            <label>Select Asset</label>
                            <select name="assetId" value={formData.assetId} onChange={handleChange} required>
                                <option value="">{assets.length === 0 ? 'No assets found for this equipment at source base' : 'Select Asset'}</option>
                                {assets.map(a => <option key={a.assetId} value={a.assetId}>{a.assetTag} (SN: {a.serialNumber})</option>)}
                            </select>
                        </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                        <button type="button" onClick={() => navigate('/transfers')} disabled={saving}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Creating...' : 'Create Pending Transfer'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewTransfer;
