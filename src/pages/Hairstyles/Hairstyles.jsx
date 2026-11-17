import React, { useState, useEffect } from 'react';
import { hairstyleService } from '../../services/hairstyleService';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import './Hairstyles.css';

const CATEGORIES = [
    'Classic Cut',
    'Modern Cut',
    'Fade',
    'Beard',
    'Shave',
    'Coloring',
    'Styling',
    'Treatment',
    'Kids',
];

const GENDERS = ['Men', 'Women', 'Kids', 'All'];
const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const EMPTY_CREATE_FORM = {
    name: '',
    category: 'Classic Cut',
    description: '',
    price: 0,
    duration: 30,
    gender: 'All',
    difficulty: 'Intermediate',
    popularity: 0,
    isActive: true,
};

const Hairstyles = () => {
    const [hairstyles, setHairstyles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Notification
    const [message, setMessage] = useState({ type: '', text: '' });

    // Create form
    const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
    const [creating, setCreating] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);

    // Edit state
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [saving, setSaving] = useState(false);

    // ===== Show temporary message =====
    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 3500);
    };

    // ===== Load hairstyles =====
    const loadHairstyles = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await hairstyleService.getAll();
            if (res.success) {
                setHairstyles(res.data);
            } else {
                setError(res.message || 'Failed to load hairstyles');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error loading hairstyles');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHairstyles();
    }, []);

    // ===== Toggle create form =====
    const toggleCreateForm = () => {
        setShowCreateForm((prev) => !prev);
        if (!showCreateForm) {
            setCreateForm(EMPTY_CREATE_FORM);
        }
    };

    // ===== Create hairstyle =====
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
                price: parseFloat(createForm.price) || 0,
                duration: parseInt(createForm.duration) || 30,
                popularity: parseInt(createForm.popularity) || 0,
            };

            const res = await hairstyleService.create(payload);

            if (res.success) {
                showMessage('success', `Hairstyle "${res.data.name}" created`);
                setCreateForm(EMPTY_CREATE_FORM);
                setShowCreateForm(false);
                await loadHairstyles();
            } else {
                showMessage('error', res.message || 'Failed to create hairstyle');
            }
        } catch (err) {
            showMessage('error', err.response?.data?.message || 'Error creating hairstyle');
        } finally {
            setCreating(false);
        }
    };

    const handleCancelCreate = () => {
        setCreateForm(EMPTY_CREATE_FORM);
        setShowCreateForm(false);
    };

    // ===== Edit hairstyle =====
    const startEdit = (hairstyle) => {
        setEditingId(hairstyle._id);
        setEditForm({
            name: hairstyle.name,
            category: hairstyle.category,
            description: hairstyle.description || '',
            price: hairstyle.price || 0,
            duration: hairstyle.duration || 30,
            gender: hairstyle.gender || 'All',
            difficulty: hairstyle.difficulty || 'Intermediate',
            popularity: hairstyle.popularity || 0,
            isActive: hairstyle.isActive !== false,
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
                price: parseFloat(editForm.price) || 0,
                duration: parseInt(editForm.duration) || 30,
                popularity: parseInt(editForm.popularity) || 0,
            };

            const res = await hairstyleService.update(editingId, payload);

            if (res.success) {
                showMessage('success', `Hairstyle "${res.data.name}" updated`);
                setEditingId(null);
                setEditForm({});
                await loadHairstyles();
            } else {
                showMessage('error', res.message || 'Failed to update hairstyle');
            }
        } catch (err) {
            showMessage('error', err.response?.data?.message || 'Error updating hairstyle');
        } finally {
            setSaving(false);
        }
    };

    // ===== Delete hairstyle =====
    const handleDelete = async (hairstyle) => {
        if (!window.confirm(`Delete "${hairstyle.name}"? This cannot be undone.`)) {
            return;
        }

        try {
            const res = await hairstyleService.delete(hairstyle._id);
            if (res.success) {
                showMessage('success', `Hairstyle "${hairstyle.name}" deleted`);
                await loadHairstyles();
            } else {
                showMessage('error', res.message || 'Failed to delete hairstyle');
            }
        } catch (err) {
            showMessage('error', err.response?.data?.message || 'Error deleting hairstyle');
        }
    };

    // ===== Render =====
    if (loading) {
        return (
            <div className="hairstyles-page">
                <h1>💇 Hairstyles Management</h1>
                <Loader message="Loading hairstyles..." />
            </div>
        );
    }

    return (
        <div className="hairstyles-page">
            <div className="hairstyles-header">
                <h1>💇 Hairstyles Management</h1>
                <button className="close-button" onClick={() => window.close()} title="Close">
                    ✕
                </button>
            </div>

            {error && <div className="notice notice-error">{error}</div>}
            {message.text && (
                <div className={`notice notice-${message.type}`}>{message.text}</div>
            )}

            {/* ===== Create new hairstyle — collapsible ===== */}
            <Card>
                <div className="collapsible-header" onClick={toggleCreateForm}>
                    <span className="collapsible-title">
                        {showCreateForm ? '➖' : '➕'} Add New Hairstyle
                    </span>
                    <span className="collapsible-hint">
                        {showCreateForm ? 'Click to collapse' : 'Click to expand'}
                    </span>
                </div>

                {showCreateForm && (
                    <form onSubmit={handleCreateSubmit} className="collapsible-body">
                        <div className="form-grid">
                            <Input
                                label="Name"
                                name="name"
                                value={createForm.name}
                                onChange={handleCreateChange}
                                required
                                placeholder="e.g., Skin Fade"
                            />
                            <Select
                                label="Category"
                                name="category"
                                value={createForm.category}
                                onChange={handleCreateChange}
                                options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                            />
                            <Select
                                label="Gender"
                                name="gender"
                                value={createForm.gender}
                                onChange={handleCreateChange}
                                options={GENDERS.map((g) => ({ value: g, label: g }))}
                            />
                            <Select
                                label="Difficulty"
                                name="difficulty"
                                value={createForm.difficulty}
                                onChange={handleCreateChange}
                                options={DIFFICULTIES.map((d) => ({ value: d, label: d }))}
                            />
                            <Input
                                label="Price ($)"
                                name="price"
                                type="number"
                                value={createForm.price}
                                onChange={handleCreateChange}
                                min="0"
                                step="0.01"
                                required
                            />
                            <Input
                                label="Duration (minutes)"
                                name="duration"
                                type="number"
                                value={createForm.duration}
                                onChange={handleCreateChange}
                                min="5"
                                max="180"
                                step="1"
                                required
                            />
                            <Input
                                label="Popularity (0-100)"
                                name="popularity"
                                type="number"
                                value={createForm.popularity}
                                onChange={handleCreateChange}
                                min="0"
                                max="100"
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
                                <Input
                                    label="Description"
                                    name="description"
                                    value={createForm.description}
                                    onChange={handleCreateChange}
                                    placeholder="Short description (max 500 chars)"
                                />
                            </div>
                        </div>

                        <div className="form-actions">
                            <Button variant="secondary" type="button" onClick={handleCancelCreate}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="success" disabled={creating}>
                                {creating ? 'Creating...' : '➕ Create Hairstyle'}
                            </Button>
                        </div>
                    </form>
                )}
            </Card>

            {/* ===== Existing hairstyles ===== */}
            <Card title={`📋 Existing Hairstyles (${hairstyles.length})`}>
                {hairstyles.length === 0 ? (
                    <p className="empty-text">No hairstyles yet. Click "Add New Hairstyle" above.</p>
                ) : (
                    <div className="list-of-hairstyles">
                        {hairstyles.map((hairstyle) => {
                            const isEditing = editingId === hairstyle._id;

                            return (
                                <div key={hairstyle._id} className="hairstyle-card">
                                    <div className="hairstyle-header">
                                        <div>
                                            <div className="hairstyle-title">
                                                {hairstyle.name}
                                                <span
                                                    className={`status-badge ${hairstyle.isActive === false ? 'status-inactive' : 'status-ok'
                                                        }`}
                                                >
                                                    {hairstyle.isActive === false ? 'Inactive' : 'Active'}
                                                </span>
                                                <span className="difficulty-badge">
                                                    {hairstyle.difficulty || 'Intermediate'}
                                                </span>
                                            </div>
                                            <div className="hairstyle-details">
                                                {hairstyle.category} · {hairstyle.gender} ·{' '}
                                                {hairstyle.duration} min · ${hairstyle.price} · ⭐{' '}
                                                {hairstyle.popularity || 0}
                                            </div>
                                            {hairstyle.description && (
                                                <div className="hairstyle-details">
                                                    {hairstyle.description}
                                                </div>
                                            )}
                                        </div>

                                        {!isEditing && (
                                            <div className="hairstyle-actions">
                                                <Button
                                                    variant="primary"
                                                    className="btn-small"
                                                    onClick={() => startEdit(hairstyle)}
                                                >
                                                    ✏️ Edit
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    className="btn-small"
                                                    onClick={() => handleDelete(hairstyle)}
                                                >
                                                    🗑 Delete
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {isEditing && (
                                        <form onSubmit={handleEditSubmit} className="expand-panel">
                                            <h4 className="expand-title">✏️ Editing "{hairstyle.name}"</h4>

                                            <div className="form-grid">
                                                <Input
                                                    label="Name"
                                                    name="name"
                                                    value={editForm.name}
                                                    onChange={handleEditChange}
                                                    required
                                                />
                                                <Select
                                                    label="Category"
                                                    name="category"
                                                    value={editForm.category}
                                                    onChange={handleEditChange}
                                                    options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                                                />
                                                <Select
                                                    label="Gender"
                                                    name="gender"
                                                    value={editForm.gender}
                                                    onChange={handleEditChange}
                                                    options={GENDERS.map((g) => ({ value: g, label: g }))}
                                                />
                                                <Select
                                                    label="Difficulty"
                                                    name="difficulty"
                                                    value={editForm.difficulty}
                                                    onChange={handleEditChange}
                                                    options={DIFFICULTIES.map((d) => ({ value: d, label: d }))}
                                                />
                                                <Input
                                                    label="Price ($)"
                                                    name="price"
                                                    type="number"
                                                    value={editForm.price}
                                                    onChange={handleEditChange}
                                                    min="0"
                                                    step="0.01"
                                                    required
                                                />
                                                <Input
                                                    label="Duration (minutes)"
                                                    name="duration"
                                                    type="number"
                                                    value={editForm.duration}
                                                    onChange={handleEditChange}
                                                    min="5"
                                                    max="180"
                                                    step="1"
                                                    required
                                                />
                                                <Input
                                                    label="Popularity (0-100)"
                                                    name="popularity"
                                                    type="number"
                                                    value={editForm.popularity}
                                                    onChange={handleEditChange}
                                                    min="0"
                                                    max="100"
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
                                                    <Input
                                                        label="Description"
                                                        name="description"
                                                        value={editForm.description}
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

export default Hairstyles;