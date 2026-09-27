import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { assignmentService } from '../services/assignmentService';
import { baseService, personnelService, assetService, equipmentTypeService } from '../services/dataService';
import { AuthContext } from '../context/AuthContext';

const NewAssignment = () => {
    const { role, baseId: userBaseId } = useContext(AuthContext);
    const navigate = useNavigate();

    const [bases, setBases] = useState([]);
    const [equipmentTypes, setEquipmentTypes] = useState([]);
    const [personnelList, setPersonnelList] = useState([]);
    const [assets, setAssets] = useState([]);
    
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        baseId: role === 'ADMIN' ? '' : userBaseId,
        equipmentTypeId: '',
        assetId: '',
        personnelId: '',
        assignedDate: new Date().toISOString().split('T')[0] + 'T00:00',
        notes: ''
    });

    useEffect(() => {
        loadDropdowns();
    }, []);

    useEffect(() => {
        if (formData.baseId) {
            loadPersonnel(formData.baseId);
        } else {
            setPersonnelList([]);
        }
    }, [formData.baseId]);

    useEffect(() => {
        if (formData.baseId && formData.equipmentTypeId) {
            loadAssets(formData.baseId, formData.equipmentTypeId);
        } else {
            setAssets([]);
        }
    }, [formData.baseId, formData.equipmentTypeId]);

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

    const loadPersonnel = async (bId) => {
        try {
            const res = await personnelService.getPersonnelByBase(bId);
            setPersonnelList(res.content || []);
        } catch (err) {
            console.error("Failed to load personnel");
        }
    };

    const loadAssets = async (bId, eqId) => {
        try {
            const res = await assetService.getAssetsByBaseAndEquipment(bId, eqId);
            // In a real app, we'd filter out already ACTIVE assets on backend, but here we show all or let backend reject
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

        if (!formData.assetId || !formData.personnelId) {
            setError("Please select both Asset and Personnel.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                assetId: parseInt(formData.assetId),
                personnelId: parseInt(formData.personnelId),
                assignedDate: formData.assignedDate,
                notes: formData.notes
            };

            await assignmentService.createAssignment(payload);
            navigate('/assignments');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create assignment.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="page-content">
            <div className="page-header" style={{ marginBottom: '1.5rem' }}>
                <h2>New Asset Assignment</h2>
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
                        <label>Personnel</label>
                        <select name="personnelId" value={formData.personnelId} onChange={handleChange} required>
                            <option value="">{personnelList.length === 0 ? 'No personnel found for base' : 'Select Personnel'}</option>
                            {personnelList.map(p => <option key={p.personnelId} value={p.personnelId}>{p.fullName} ({p.employeeNumber})</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Equipment Type</label>
                        <select name="equipmentTypeId" value={formData.equipmentTypeId} onChange={handleChange} required>
                            <option value="">Select Equipment</option>
                            {equipmentTypes.map(e => <option key={e.equipmentTypeId} value={e.equipmentTypeId}>{e.equipmentName}</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Asset</label>
                        <select name="assetId" value={formData.assetId} onChange={handleChange} required>
                            <option value="">{assets.length === 0 ? 'No assets found for this equipment at base' : 'Select Asset'}</option>
                            {assets.map(a => <option key={a.assetId} value={a.assetId}>{a.assetTag} (SN: {a.serialNumber})</option>)}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Assigned Date</label>
                        <input type="datetime-local" name="assignedDate" value={formData.assignedDate} onChange={handleChange} required />
                    </div>

                    <div className="form-group">
                        <label>Notes</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} rows="3"></textarea>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
                        <button type="button" onClick={() => navigate('/assignments')} disabled={saving}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Assign Asset'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewAssignment;
