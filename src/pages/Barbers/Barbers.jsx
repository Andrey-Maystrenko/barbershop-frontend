import React, { useState, useEffect } from 'react';
import { barberService } from '../../services/barberService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import './Barbers.css';

const SPECIALIZATIONS = [
    'Classic Cut',
    'Fade',
    'Beard Trim',
    'Hot Towel Shave',
    'Coloring',
    'Kids Cut',
];

const EMPTY_CREATE_FORM = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialization: ['Classic Cut'],
    experience: 0,
    bio: '',
    isActive: true,
};

const Barbers = () => {
    const [barbers, setBarbers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Notification
    const [message, setMessage] = useState({ type: '', text: '' });

    // Create form
    const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
    const [creating, setCreating] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Edit state (one row at a time)
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);

    // ===== Show temporary message =====
    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3500);
    };

    // ===== Load barbers =====
    const loadBarbers = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await barberService.getAll();
            if (res.success) {
                setBarbers(res.data);
            } else {
                setError(res.message || 'Failed to load barbers');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error loading barbers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBarbers();
    }, []);

    // ===== Toggle create form =====
    const toggleCreateForm = () => {
        setShowCreateForm((prev) => !prev);
        if (!showCreateForm) {
            setCreateForm(EMPTY_CREATE_FORM);
        }
    };

    // ===== Specialization checkbox handler =====
    const toggleSpecialization = (form, setForm, spec) => {
        const current = form.specialization || [];
        const updated = current.includes(spec)
            ? current.filter((s) => s !== spec)
            : [...current, spec];
        setForm((prev) => ({ ...prev, specialization: updated }));
    };

    // ===== Create barber =====
    const handleCreateChange = (e) => {
        const { name, value, type, checked } = e.target;
        setCreateForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        setCreating(true);

        try {
            const payload = {
                ...createForm,
                experience: parseFloat(createForm.experience) || 0,
            };

            const res = await barberService.create(payload);

            if (res.success) {
                showMessage('success', `Barber "${res.data.firstName} ${res.data.lastName}" created`);
                setCreateForm(EMPTY_CREATE_FORM);
                setShowCreateForm(false);
                await loadBarbers();
            } else {
                showMessage('error', res.message || 'Failed to create barber');
            }
        } catch (err) {
            showMessage('error', err.response?.data?.message || 'Error creating barber');
        } finally {
            setCreating(false);
        }
    };

    const handleCancelCreate = () => {
        setCreateForm(EMPTY_CREATE_FORM);
        setShowCreateForm(false);
    };

    // ===== Edit barber =====
    const startEdit = (barber) => {
        setEditingId(barber._id);
        setEditForm({
            firstName: barber.firstName,
            lastName: barber.lastName,
            email: barber.email,
            phone: barber.phone,
            specialization: barber.specialization || [],
            experience: barber.experience || 0,
            bio: barber.bio || '',
            isActive: barber.isActive !== false,
        });
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const handleEditChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const payload = {
                ...editForm,
                experience: parseFloat(editForm.experience) || 0,
            };

            const res = await barberService.update(editingId, payload);

            if (res.success) {
                showMessage('success', `Barber "${res.data.firstName} ${res.data.lastName}" updated`);
                setEditingId(null);
                setEditForm({});
                await loadBarbers();
            } else {
                showMessage('error', res.message || 'Failed to update barber');
            }
        } catch (err) {
            showMessage('error', err.response?.data?.message || 'Error updating barber');
        } finally {
            setSaving(false);
        }
    };

    // ===== Delete barber =====
    const handleDelete = async (barber) => {
        if (!window.confirm(`Delete "${barber.firstName} ${barber.lastName}"? This cannot be undone.`)) {
            return;
        }

        try {
            const res = await barberService.delete(barber._id);
            if (res.success) {
                showMessage('success', `Barber "${barber.firstName} ${barber.lastName}" deleted`);
                await loadBarbers();
            } else {
                showMessage('error', res.message || 'Failed to delete barber');
            }
        } catch (err) {
            showMessage('error', err.response?.data?.message || 'Error deleting barber');
        }
    };

    // ===== Render =====
    if (loading) {
        return (
            <div className="barbers-page">
                <h1>💈 Barbers Management</h1>
                <Loader message="Loading barbers..." />
            </div>
        );
    }

    return (
        <div className="barbers-page">
            <div className="barbers-header">
                <h1>💈 Barbers Management</h1>
                <button className="close-button" onClick={() => window.close()} title="Close">
                    ✕
                </button>
            </div>

            {error && <div className="notice notice-error">{error}</div>}
            {message.text && (
                <div className={`notice notice-${message.type}`}>{message.text}</div>
            )}

            {/* ===== Create new barber — collapsible ===== */}
            <Card>
                <div className="collapsible-header" onClick={toggleCreateForm}>
                    <span className="collapsible-title">
                        {showCreateForm ? '➖' : '➕'} Add New Barber
                    </span>
                    <span className="collapsible-hint">
                        {showCreateForm ? 'Click to collapse' : 'Click to expand'}
                    </span>
                </div>

                {showCreateForm && (
                    <form onSubmit={handleCreateSubmit} className="collapsible-body">
                        <div className="form-grid">
                            <Input
                                label="First Name"
                                name="firstName"
                                value={createForm.firstName}
                                onChange={handleCreateChange}
                                required
                                placeholder="e.g., John"
                            />
                            <Input
                                label="Last Name"
                                name="lastName"
                                value={createForm.lastName}
                                onChange={handleCreateChange}
                                required
                                placeholder="e.g., Doe"
                            />
                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                value={createForm.email}
                                onChange={handleCreateChange}
                                required
                                placeholder="john.doe@barbershop.com"
                            />
                            <Input
                                label="Phone"
                                name="phone"
                                value={createForm.phone}
                                onChange={handleCreateChange}
                                required
                                placeholder="+1-555-123-4567"
                            />
                            <Input
                                label="Experience (years)"
                                name="experience"
                                type="number"
                                value={createForm.experience}
                                onChange={handleCreateChange}
                                min="0"
                                max="50"
                                step="1"
                            />
                            <div className="checkbox-group">
                                <label className="checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="isActive"
                                        checked={createForm.isActive}
                                        onChange={handleCreateChange}
                                    />
                                    {' '}Active
                                </label>
                            </div>
                            <div className="form-full">
                                <label className="field-label">Specialization</label>
                                <div className="checkbox-row">
                                    {SPECIALIZATIONS.map((spec) => (
                                        <label key={spec} className="checkbox-label">
                                            <input
                                                type="checkbox"
                                                checked={createForm.specialization.includes(spec)}
                                                onChange={() =>
                                                    toggleSpecialization(createForm, setCreateForm, spec)
                                                }
                                            />
                                            {' '}{spec}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="form-full">
                                <Input
                                    label="Bio"
                                    name="bio"
                                    value={createForm.bio}
                                    onChange={handleCreateChange}
                                    placeholder="Short bio (max 500 chars)"
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <Button variant="secondary" type="button" onClick={handleCancelCreate}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="success" disabled={creating}>
                                {creating ? 'Creating...' : '➕ Create Barber'}
                            </Button>
                        </div>
                    </form>
                )}
            </Card>

            {/* ===== Existing barbers ===== */}
            <Card title={`📋 Existing Barbers (${barbers.length})`}>
                {barbers.length === 0 ? (
                    <p className="empty-text">No barbers yet. Click "Add New Barber" above.</p>
                ) : (
                    <div className="list-of-barbers">
                        {barbers.map((barber) => {
                            const isEditing = editingId === barber._id;

                            return (
                                <div key={barber._id} className="barber-card">
                                    <div className="barber-header">
                                        <div>
                                            <div className="barber-title">
                                                {barber.firstName} {barber.lastName}
                                                <span
                                                    className={`status-badge ${barber.isActive === false ? 'status-inactive' : 'status-ok'
                                                        }`}
                                                >
                                                    {barber.isActive === false ? 'Inactive' : 'Active'}
                                                </span>
                                            </div>
                                            <div className="barber-details">
                                                {barber.email} · {barber.phone}
                                            </div>
                                            <div className="barber-details">
                                                {barber.specialization?.join(', ') || 'No specialization'} ·{' '}
                                                {barber.experience || 0} yrs · ⭐ {barber.rating || 0}
                                            </div>
                                        </div>

                                        {!isEditing && (
                                            <div className="barber-actions">
                                                <Button
                                                    variant="primary"
                                                    className="btn-small"
                                                    onClick={() => startEdit(barber)}
                                                >
                                                    ✏️ Edit
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    className="btn-small"
                                                    onClick={() => handleDelete(barber)}
                                                >
                                                    🗑 Delete
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {/* ===== Edit panel ===== */}
                                    {isEditing && (
                                        <form onSubmit={handleEditSubmit} className="expand-panel">
                                            <h4 className="expand-title">
                                                ✏️ Editing "{barber.firstName} {barber.lastName}"
                                            </h4>

                                            <div className="form-grid">
                                                <Input
                                                    label="First Name"
                                                    name="firstName"
                                                    value={editForm.firstName}
                                                    onChange={handleEditChange}
                                                    required
                                                />
                                                <Input
                                                    label="Last Name"
                                                    name="lastName"
                                                    value={editForm.lastName}
                                                    onChange={handleEditChange}
                                                    required
                                                />
                                                <Input
                                                    label="Email"
                                                    name="email"
                                                    type="email"
                                                    value={editForm.email}
                                                    onChange={handleEditChange}
                                                    required
                                                />
                                                <Input
                                                    label="Phone"
                                                    name="phone"
                                                    value={editForm.phone}
                                                    onChange={handleEditChange}
                                                    required
                                                />
                                                <Input
                                                    label="Experience (years)"
                                                    name="experience"
                                                    type="number"
                                                    value={editForm.experience}
                                                    onChange={handleEditChange}
                                                    min="0"
                                                    max="50"
                                                    step="1"
                                                />
                                                <div className="checkbox-group">
                                                    <label className="checkbox-label">
                                                        <input
                                                            type="checkbox"
                                                            name="isActive"
                                                            checked={editForm.isActive}
                                                            onChange={handleEditChange}
                                                        />
                                                        {' '}Active
                                                    </label>
                                                </div>
                                                <div className="form-full">
                                                    <label className="field-label">Specialization</label>
                                                    <div className="checkbox-row">
                                                        {SPECIALIZATIONS.map((spec) => (
                                                            <label key={spec} className="checkbox-label">
                                                                <input
                                                                    type="checkbox"
                                                                    checked={editForm.specialization.includes(spec)}
                                                                    onChange={() =>
                                                                        toggleSpecialization(editForm, setEditForm, spec)
                                                                    }
                                                                />
                                                                {' '}{spec}
                                                            </label>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="form-full">
                                                    <Input
                                                        label="Bio"
                                                        name="bio"
                                                        value={editForm.bio}
                                                        onChange={handleEditChange}
                                                    />
                                                </div>
                                            </div>

                                            <div className="form-actions">
                                                <Button variant="secondary" type="button" onClick={cancelEdit}>
                                                    Cancel
                                                </Button>
                                                <Button variant="success" type="submit" disabled={saving}>
                                                    {saving ? 'Saving...' : '💾 Save Changes'}
                                                </Button>
                                            </div>
                                        </form>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Barbers;