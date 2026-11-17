import React, { useState, useEffect } from 'react';
import { operationService } from '../../services/operationService';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import './Operations.css';

const CATEGORIES = [
    'Haircut',
    'Beard',
    'Shaving',
    'Coloring',
    'Styling',
    'Treatment',
    'Massage',
    'Other',
];

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

const EMPTY_CREATE_FORM = {
    name: '',
    category: 'Haircut',
    description: '',
    duration: 30,
    price: 0,
    difficulty: 'Intermediate',
    isActive: true,
};

const Operations = () => {
    const [operations, setOperations] = useState([]);
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

    // ===== Load operations =====
    const loadOperations = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await operationService.getAll();
            if (res.success) {
                setOperations(res.data);
            } else {
                setError(res.message || 'Failed to load operations');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error loading operations');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOperations();
    }, []);

    // ===== Toggle create form =====
    const toggleCreateForm = () => {
        setShowCreateForm((prev) => !prev);
        if (!showCreateForm) {
            setCreateForm(EMPTY_CREATE_FORM);
        }
    };

    // ===== Create operation =====
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
                duration: parseInt(createForm.duration) || 30,
                price: parseFloat(createForm.price) || 0,
            };

            const res = await operationService.create(payload);

            if (res.success) {
                showMessage('success', `Operation "${res.data.name}" created`);
                setCreateForm(EMPTY_CREATE_FORM);
                setShowCreateForm(false);
                await loadOperations();
            } else {
                showMessage('error', res.message || 'Failed to create operation');
            }
        } catch (err) {
            showMessage('error', err.response?.data?.message || 'Error creating operation');
        } finally {
            setCreating(false);
        }
    };

    const handleCancelCreate = () => {
        setCreateForm(EMPTY_CREATE_FORM);
        setShowCreateForm(false);
    };

    // ===== Edit operation =====
    const startEdit = (operation) => {
        setEditingId(operation._id);
        setEditForm({
            name: operation.name,
            category: operation.category,
            description: operation.description || '',
            duration: operation.duration || 30,
            price: operation.price || 0,
            difficulty: operation.difficulty || 'Intermediate',
            isActive: operation.isActive !== false,
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
                duration: parseInt(editForm.duration) || 30,
                price: parseFloat(editForm.price) || 0,
            };

            const res = await operationService.update(editingId, payload);

            if (res.success) {
                showMessage('success', `Operation "${res.data.name}" updated`);
                setEditingId(null);
                setEditForm({});
                await loadOperations();
            } else {
                showMessage('error', res.message || 'Failed to update operation');
            }
        } catch (err) {
            showMessage('error', err.response?.data?.message || 'Error updating operation');
        } finally {
            setSaving(false);
        }
    };

    // ===== Delete operation =====
    const handleDelete = async (operation) => {
        if (!window.confirm(`Delete "${operation.name}"? This cannot be undone.`)) {
            return;
        }

        try {
            const res = await operationService.delete(operation._id);
            if (res.success) {
                showMessage('success', `Operation "${operation.name}" deleted`);
                await loadOperations();
            } else {
                showMessage('error', res.message || 'Failed to delete operation');
            }
        } catch (err) {
            showMessage('error', err.response?.data?.message || 'Error deleting operation');
        }
    };

    // ===== Render =====
    if (loading) {
        return (
            <div className="operations-page">
                <h1>➕ Operations Management</h1>
                <Loader message="Loading operations..." />
            </div>
        );
    }

    return (
        <div className="operations-page">
            <div className="operations-header">
                <h1>➕ Operations Management</h1>
                <button className="close-button" onClick={() => window.close()} title="Close">
                    ✕
                </button>
            </div>

            {error && <div className="notice notice-error">{error}</div>}
            {message.text && (
                <div className={`notice notice-${message.type}`}>{message.text}</div>
            )}

            {/* ===== Create new operation — collapsible ===== */}
            <Card>
                <div className="collapsible-header" onClick={toggleCreateForm}>
                    <span className="collapsible-title">
                        {showCreateForm ? '➖' : '➕'} Add New Operation
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
                                placeholder="e.g., Classic Haircut"
                            />
                            <Select
                                label="Category"
                                name="category"
                                value={createForm.category}
                                onChange={handleCreateChange}
                                options={CATEGORIES.map((c) => ({ value: c, label: c }))}
                            />
                            <Select
                                label="Difficulty"
                                name="difficulty"
                                value={createForm.difficulty}
                                onChange={handleCreateChange}
                                options={DIFFICULTIES.map((d) => ({ value: d, label: d }))}
                            />
                            <Input
                                label="Duration (minutes)"
                                name="duration"
                                type="number"
                                value={createForm.duration}
                                onChange={handleCreateChange}
                                min="1"
                                max="300"
                                step="1"
                                required
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
                                {creating ? 'Creating...' : '➕ Create Operation'}
                            </Button>
                        </div>
                    </form>
                )}
            </Card>

            {/* ===== Existing operations ===== */}
            <Card title={`📋 Existing Operations (${operations.length})`}>
                {operations.length === 0 ? (
                    <p className="empty-text">No operations yet. Click "Add New Operation" above.</p>
                ) : (
                    <div className="list-of-operations">
                        {operations.map((operation) => {
                            const isEditing = editingId === operation._id;

                            return (
                                <div key={operation._id} className="operation-card">
                                    <div className="operation-header">
                                        <div>
                                            <div className="operation-title">
                                                {operation.name}
                                                <span
                                                    className={`status-badge ${operation.isActive === false ? 'status-inactive' : 'status-ok'
                                                        }`}
                                                >
                                                    {operation.isActive === false ? 'Inactive' : 'Active'}
                                                </span>
                                                <span className="difficulty-badge">
                                                    {operation.difficulty || 'Intermediate'}
                                                </span>
                                            </div>
                                            <div className="operation-details">
                                                {operation.category} · {operation.duration} min · ${operation.price}
                                            </div>
                                            {operation.description && (
                                                <div className="operation-details">
                                                    {operation.description}
                                                </div>
                                            )}
                                        </div>

                                        {!isEditing && (
                                            <div className="operation-actions">
                                                <Button
                                                    variant="primary"
                                                    className="btn-small"
                                                    onClick={() => startEdit(operation)}
                                                >
                                                    ✏️ Edit
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    className="btn-small"
                                                    onClick={() => handleDelete(operation)}
                                                >
                                                    🗑 Delete
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {isEditing && (
                                        <form onSubmit={handleEditSubmit} className="expand-panel">
                                            <h4 className="expand-title">✏️ Editing "{operation.name}"</h4>

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
                                                    label="Difficulty"
                                                    name="difficulty"
                                                    value={editForm.difficulty}
                                                    onChange={handleEditChange}
                                                    options={DIFFICULTIES.map((d) => ({ value: d, label: d }))}
                                                />
                                                <Input
                                                    label="Duration (minutes)"
                                                    name="duration"
                                                    type="number"
                                                    value={editForm.duration}
                                                    onChange={handleEditChange}
                                                    min="1"
                                                    max="300"
                                                    step="1"
                                                    required
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

export default Operations;