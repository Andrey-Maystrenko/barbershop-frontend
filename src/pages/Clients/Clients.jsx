import React, { useState, useEffect } from 'react';
import { clientService } from '../../services/clientService';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import './Clients.css';

const EMPTY_CREATE_FORM = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    isActive: true,
};

const Clients = () => {
    const [clients, setClients] = useState([]);
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

    // ===== Load clients =====
    const loadClients = async () => {
        try {
            setLoading(true);
            setError('');
            const res = await clientService.getAll();
            if (res.success) {
                setClients(res.data);
            } else {
                setError(res.message || 'Failed to load clients');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error loading clients');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadClients();
    }, []);

    // ===== Toggle create form =====
    const toggleCreateForm = () => {
        setShowCreateForm((prev) => !prev);
        if (!showCreateForm) {
            setCreateForm(EMPTY_CREATE_FORM);
        }
    };

    // ===== Create client =====
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
            const res = await clientService.create(createForm);

            if (res.success) {
                showMessage('success', `Client "${res.data.firstName} ${res.data.lastName}" created`);
                setCreateForm(EMPTY_CREATE_FORM);
                setShowCreateForm(false);
                await loadClients();
            } else {
                showMessage('error', res.message || 'Failed to create client');
            }
        } catch (err) {
            showMessage('error', err.response?.data?.message || 'Error creating client');
        } finally {
            setCreating(false);
        }
    };

    const handleCancelCreate = () => {
        setCreateForm(EMPTY_CREATE_FORM);
        setShowCreateForm(false);
    };

    // ===== Edit client =====
    const startEdit = (client) => {
        setEditingId(client._id);
        setEditForm({
            firstName: client.firstName,
            lastName: client.lastName,
            email: client.email,
            phone: client.phone,
            isActive: client.isActive !== false,
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
            const res = await clientService.update(editingId, editForm);

            if (res.success) {
                showMessage('success', `Client "${res.data.firstName} ${res.data.lastName}" updated`);
                setEditingId(null);
                setEditForm({});
                await loadClients();
            } else {
                showMessage('error', res.message || 'Failed to update client');
            }
        } catch (err) {
            showMessage('error', err.response?.data?.message || 'Error updating client');
        } finally {
            setSaving(false);
        }
    };

    // ===== Delete client =====
    const handleDelete = async (client) => {
        if (!window.confirm(`Delete "${client.firstName} ${client.lastName}"? This cannot be undone.`)) {
            return;
        }

        try {
            const res = await clientService.delete(client._id);
            if (res.success) {
                showMessage('success', `Client "${client.firstName} ${client.lastName}" deleted`);
                await loadClients();
            } else {
                showMessage('error', res.message || 'Failed to delete client');
            }
        } catch (err) {
            showMessage('error', err.response?.data?.message || 'Error deleting client');
        }
    };

    // ===== Render =====
    if (loading) {
        return (
            <div className="clients-page">
                <h1>👥 Clients Management</h1>
                <Loader message="Loading clients..." />
            </div>
        );
    }

    return (
        <div className="clients-page">
            <div className="clients-header">
                <h1>👥 Clients Management</h1>
                <button className="close-button" onClick={() => window.close()} title="Close">
                    ✕
                </button>
            </div>

            {error && <div className="notice notice-error">{error}</div>}
            {message.text && (
                <div className={`notice notice-${message.type}`}>{message.text}</div>
            )}

            {/* ===== Create new client — collapsible ===== */}
            <Card>
                <div className="collapsible-header" onClick={toggleCreateForm}>
                    <span className="collapsible-title">
                        {showCreateForm ? '➖' : '➕'} Add New Client
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
                                placeholder="e.g., Smith"
                            />
                            <Input
                                label="Email"
                                name="email"
                                type="email"
                                value={createForm.email}
                                onChange={handleCreateChange}
                                required
                                placeholder="john.smith@email.com"
                            />
                            <Input
                                label="Phone"
                                name="phone"
                                value={createForm.phone}
                                onChange={handleCreateChange}
                                required
                                placeholder="+1-555-123-4567"
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
                        </div>

                        <div className="form-actions">
                            <Button variant="secondary" type="button" onClick={handleCancelCreate}>
                                Cancel
                            </Button>
                            <Button type="submit" variant="success" disabled={creating}>
                                {creating ? 'Creating...' : '➕ Create Client'}
                            </Button>
                        </div>
                    </form>
                )}
            </Card>

            {/* ===== Existing clients ===== */}
            <Card title={`📋 Existing Clients (${clients.length})`}>
                {clients.length === 0 ? (
                    <p className="empty-text">No clients yet. Click "Add New Client" above.</p>
                ) : (
                    <div className="list-of-clients">
                        {clients.map((client) => {
                            const isEditing = editingId === client._id;

                            return (
                                <div key={client._id} className="client-card">
                                    <div className="client-header">
                                        <div>
                                            <div className="client-title">
                                                {client.firstName} {client.lastName}
                                                <span
                                                    className={`status-badge ${client.isActive === false ? 'status-inactive' : 'status-ok'
                                                        }`}
                                                >
                                                    {client.isActive === false ? 'Inactive' : 'Active'}
                                                </span>
                                            </div>
                                            <div className="client-details">
                                                {client.email} · {client.phone}
                                            </div>
                                            <div className="client-details">
                                                Visits: {client.stats?.totalVisits || 0} · Spent: $
                                                {(client.stats?.totalSpent || 0).toFixed(2)}
                                            </div>
                                        </div>

                                        {!isEditing && (
                                            <div className="client-actions">
                                                <Button
                                                    variant="primary"
                                                    className="btn-small"
                                                    onClick={() => startEdit(client)}
                                                >
                                                    ✏️ Edit
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    className="btn-small"
                                                    onClick={() => handleDelete(client)}
                                                >
                                                    🗑 Delete
                                                </Button>
                                            </div>
                                        )}
                                    </div>

                                    {isEditing && (
                                        <form onSubmit={handleEditSubmit} className="expand-panel">
                                            <h4 className="expand-title">
                                                ✏️ Editing "{client.firstName} {client.lastName}"
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

export default Clients;