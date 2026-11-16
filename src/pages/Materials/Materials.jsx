import React, { useState, useEffect } from 'react';
import { materialService } from '../../services/materialService';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import './Materials.css';

const CATEGORIES = [
  'Hair Products',
  'Shaving',
  'Beard',
  'Styling',
  'Coloring',
  'Tools',
  'Disposable',
  'Cleaning',
  'Other',
];

const UNITS = ['ml', 'oz', 'g', 'kg', 'bottle', 'tube', 'piece', 'pack', 'pair', 'set'];

const EMPTY_CREATE_FORM = {
  name: '',
  category: 'Other',
  description: '',
  quantity: 0,
  unit: 'piece',
  price: 0,
  reorderLevel: 5,
  reorderQuantity: 10,
  barcode: '',
  location: '',
  notes: '',
};

const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Notification
  const [message, setMessage] = useState({ type: '', text: '' });

  // Create form
  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);   // ← NEW: collapsed by default

  // Edit state (one row at a time)
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  // Adjust stock state (one row at a time)
  const [adjustingId, setAdjustingId] = useState(null);
  const [adjustForm, setAdjustForm] = useState({ amount: '', action: 'add', reason: '' });
  const [adjusting, setAdjusting] = useState(false);

  // ===== Show temporary message =====
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3500);
  };

  // ===== Load materials =====
  const loadMaterials = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await materialService.getAll();
      if (res.success) {
        setMaterials(res.data);
      } else {
        setError(res.message || 'Failed to load materials');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading materials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  // ===== Toggle create form =====
  const toggleCreateForm = () => {
    setShowCreateForm((prev) => !prev);
    // Reset form when opening fresh
    if (!showCreateForm) {
      setCreateForm(EMPTY_CREATE_FORM);
    }
  };

  // ===== Create material =====
  const handleCreateChange = (e) => {
    const { name, value } = e.target;
    setCreateForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreating(true);

    try {
      const payload = {
        ...createForm,
        quantity: parseFloat(createForm.quantity) || 0,
        price: parseFloat(createForm.price) || 0,
        reorderLevel: parseFloat(createForm.reorderLevel) || 0,
        reorderQuantity: parseFloat(createForm.reorderQuantity) || 1,
      };

      const res = await materialService.create(payload);

      if (res.success) {
        showMessage('success', `Material "${res.data.name}" created successfully`);
        setCreateForm(EMPTY_CREATE_FORM);
        setShowCreateForm(false);          // ← collapse after create
        await loadMaterials();
      } else {
        showMessage('error', res.message || 'Failed to create material');
      }
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Error creating material');
    } finally {
      setCreating(false);
    }
  };

  const handleCancelCreate = () => {
    setCreateForm(EMPTY_CREATE_FORM);
    setShowCreateForm(false);
  };

  // ===== Edit material =====
  const startEdit = (material) => {
    setEditingId(material._id);
    setAdjustingId(null);
    setEditForm({
      name: material.name,
      category: material.category,
      description: material.description || '',
      unit: material.unit,
      price: material.price || 0,
      reorderLevel: material.reorderLevel || 5,
      reorderQuantity: material.reorderQuantity || 10,
      barcode: material.barcode || '',
      location: material.location || '',
      notes: material.notes || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const payload = {
        ...editForm,
        price: parseFloat(editForm.price) || 0,
        reorderLevel: parseFloat(editForm.reorderLevel) || 0,
        reorderQuantity: parseFloat(editForm.reorderQuantity) || 1,
      };

      const res = await materialService.update(editingId, payload);

      if (res.success) {
        showMessage('success', `Material "${res.data.name}" updated`);
        setEditingId(null);
        setEditForm({});
        await loadMaterials();
      } else {
        showMessage('error', res.message || 'Failed to update material');
      }
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Error updating material');
    } finally {
      setSaving(false);
    }
  };

  // ===== Adjust stock =====
  const startAdjust = (material) => {
    setAdjustingId(material._id);
    setEditingId(null);
    setAdjustForm({ amount: '', action: 'add', reason: '' });
  };

  const cancelAdjust = () => {
    setAdjustingId(null);
    setAdjustForm({ amount: '', action: 'add', reason: '' });
  };

  const handleAdjustChange = (e) => {
    const { name, value } = e.target;
    setAdjustForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAdjustSubmit = async (e) => {
    e.preventDefault();
    setAdjusting(true);

    try {
      const amount = parseFloat(adjustForm.amount);
      if (!amount || amount <= 0) {
        showMessage('error', 'Amount must be greater than 0');
        setAdjusting(false);
        return;
      }

      let res;
      if (adjustForm.action === 'add') {
        res = await materialService.addStock(adjustingId, amount, adjustForm.reason);
      } else {
        res = await materialService.useStock(adjustingId, amount, adjustForm.reason);
      }

      if (res.success) {
        showMessage('success', res.message || 'Stock adjusted');
        setAdjustingId(null);
        setAdjustForm({ amount: '', action: 'add', reason: '' });
        await loadMaterials();
      } else {
        showMessage('error', res.message || 'Failed to adjust stock');
      }
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Error adjusting stock');
    } finally {
      setAdjusting(false);
    }
  };

  // ===== Delete material =====
  const handleDelete = async (material) => {
    if (!window.confirm(`Delete "${material.name}"? This cannot be undone.`)) return;

    try {
      const res = await materialService.delete(material._id);
      if (res.success) {
        showMessage('success', `Material "${material.name}" deleted`);
        await loadMaterials();
      } else {
        showMessage('error', res.message || 'Failed to delete material');
      }
    } catch (err) {
      showMessage('error', err.response?.data?.message || 'Error deleting material');
    }
  };

  // ===== Get stock status =====
  const getStatusClass = (material) => {
    if (material.quantity <= 0) return 'status-out';
    if (material.quantity <= material.reorderLevel) return 'status-low';
    return 'status-ok';
  };

  const getStatusText = (material) => {
    if (material.quantity <= 0) return 'Out of Stock';
    if (material.quantity <= material.reorderLevel) return 'Low Stock';
    return 'In Stock';
  };

  // ===== Render =====
  if (loading) {
    return (
      <div className="materials-page">
        <h1>📦 Materials Management</h1>
        <Loader message="Loading materials..." />
      </div>
    );
  }

  return (
    <div className="materials-page">
      <div className="materials-header">
        <h1>📦 Materials Management</h1>
        <button className="close-button" onClick={() => window.close()} title="Close">
          ✕
        </button>
      </div>

      {error && <div className="notice notice-error">{error}</div>}
      {message.text && (
        <div className={`notice notice-${message.type}`}>{message.text}</div>
      )}

      {/* ===== Create new material — collapsible ===== */}
      <Card>
        <div className="collapsible-header" onClick={toggleCreateForm}>
          <span className="collapsible-title">
            {showCreateForm ? '➖' : '➕'} Add New Material
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
                placeholder="e.g., Disinfectant Spray"
              />

              <Select
                label="Category"
                name="category"
                value={createForm.category}
                onChange={handleCreateChange}
                options={CATEGORIES.map((c) => ({ value: c, label: c }))}
              />

              <Select
                label="Unit"
                name="unit"
                value={createForm.unit}
                onChange={handleCreateChange}
                options={UNITS.map((u) => ({ value: u, label: u }))}
              />

              <Input
                label="Initial Quantity"
                name="quantity"
                type="number"
                value={createForm.quantity}
                onChange={handleCreateChange}
                min="0"
                step="0.01"
              />

              <Input
                label="Price per Unit ($)"
                name="price"
                type="number"
                value={createForm.price}
                onChange={handleCreateChange}
                min="0"
                step="0.01"
              />

              <Input
                label="Reorder Level"
                name="reorderLevel"
                type="number"
                value={createForm.reorderLevel}
                onChange={handleCreateChange}
                min="0"
                step="1"
              />

              <Input
                label="Reorder Quantity"
                name="reorderQuantity"
                type="number"
                value={createForm.reorderQuantity}
                onChange={handleCreateChange}
                min="1"
                step="1"
              />

              <Input
                label="Barcode"
                name="barcode"
                value={createForm.barcode}
                onChange={handleCreateChange}
                placeholder="Optional"
              />

              <Input
                label="Location"
                name="location"
                value={createForm.location}
                onChange={handleCreateChange}
                placeholder="e.g., Shelf A-3"
              />

              <div className="form-full">
                <Input
                  label="Description"
                  name="description"
                  value={createForm.description}
                  onChange={handleCreateChange}
                  placeholder="Optional short description"
                />
              </div>

              <div className="form-full">
                <Input
                  label="Notes"
                  name="notes"
                  value={createForm.notes}
                  onChange={handleCreateChange}
                  placeholder="Optional notes"
                />
              </div>
            </div>

            <div className="form-actions">
              <Button variant="secondary" type="button" onClick={handleCancelCreate}>
                Cancel
              </Button>
              <Button type="submit" variant="success" disabled={creating}>
                {creating ? 'Creating...' : '➕ Create Material'}
              </Button>
            </div>
          </form>
        )}
      </Card>

      {/* ===== Existing materials ===== */}
      <Card title={`📋 Existing Materials (${materials.length})`}>
        {materials.length === 0 ? (
          <p className="empty-text">No materials yet. Click "Add New Material" above.</p>
        ) : (
          // <div className="materials-list">
          <div className="list-of-materials">
            {materials.map((material) => {
              const isEditing = editingId === material._id;
              const isAdjusting = adjustingId === material._id;

              return (
                <div key={material._id} className="material-card">
                  <div className="material-header">
                    <div>
                      <div className="material-title">
                        {material.name}
                        <span className={`status-badge ${getStatusClass(material)}`}>
                          {getStatusText(material)}
                        </span>
                      </div>
                      <div className="material-details">
                        {material.category} · {material.unit} · ${material.price} ·
                        Available: <strong>{material.quantity}</strong>
                      </div>
                    </div>

                    {!isEditing && !isAdjusting && (
                      <div className="material-actions">
                        <Button
                          variant="primary"
                          className="btn-small"
                          onClick={() => startEdit(material)}
                        >
                          ✏️ Edit
                        </Button>
                        <Button
                          variant="secondary"
                          className="btn-small"
                          onClick={() => startAdjust(material)}
                        >
                          📦 Adjust
                        </Button>
                        <Button
                          variant="danger"
                          className="btn-small"
                          onClick={() => handleDelete(material)}
                        >
                          🗑 Delete
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* ===== Edit panel ===== */}
                  {isEditing && (
                    <form onSubmit={handleEditSubmit} className="expand-panel">
                      <h4 className="expand-title">✏️ Editing "{material.name}"</h4>

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
                          label="Unit"
                          name="unit"
                          value={editForm.unit}
                          onChange={handleEditChange}
                          options={UNITS.map((u) => ({ value: u, label: u }))}
                        />
                        <Input
                          label="Price per Unit ($)"
                          name="price"
                          type="number"
                          value={editForm.price}
                          onChange={handleEditChange}
                          min="0"
                          step="0.01"
                        />
                        <Input
                          label="Reorder Level"
                          name="reorderLevel"
                          type="number"
                          value={editForm.reorderLevel}
                          onChange={handleEditChange}
                          min="0"
                          step="1"
                        />
                        <Input
                          label="Reorder Quantity"
                          name="reorderQuantity"
                          type="number"
                          value={editForm.reorderQuantity}
                          onChange={handleEditChange}
                          min="1"
                          step="1"
                        />
                        <Input
                          label="Barcode"
                          name="barcode"
                          value={editForm.barcode}
                          onChange={handleEditChange}
                        />
                        <Input
                          label="Location"
                          name="location"
                          value={editForm.location}
                          onChange={handleEditChange}
                        />
                        <div className="form-full">
                          <Input
                            label="Description"
                            name="description"
                            value={editForm.description}
                            onChange={handleEditChange}
                          />
                        </div>
                        <div className="form-full">
                          <Input
                            label="Notes"
                            name="notes"
                            value={editForm.notes}
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

                  {/* ===== Adjust stock panel ===== */}
                  {isAdjusting && (
                    <form onSubmit={handleAdjustSubmit} className="expand-panel">
                      <h4 className="expand-title">
                        📦 Adjust Stock: {material.name} (current: {material.quantity}{' '}
                        {material.unit})
                      </h4>

                      <div className="adjust-row">
                        <div className="adjust-action">
                          <label>
                            <input
                              type="radio"
                              name="action"
                              value="add"
                              checked={adjustForm.action === 'add'}
                              onChange={handleAdjustChange}
                            />
                            {' '}➕ Add
                          </label>
                          <label>
                            <input
                              type="radio"
                              name="action"
                              value="use"
                              checked={adjustForm.action === 'use'}
                              onChange={handleAdjustChange}
                            />
                            {' '}➖ Use
                          </label>
                        </div>

                        <Input
                          label={`Amount (${material.unit})`}
                          name="amount"
                          type="number"
                          value={adjustForm.amount}
                          onChange={handleAdjustChange}
                          min="0.01"
                          step="0.01"
                          required
                          placeholder="e.g., 5"
                        />

                        <Input
                          label="Reason"
                          name="reason"
                          value={adjustForm.reason}
                          onChange={handleAdjustChange}
                          placeholder="e.g., New delivery / Used for client"
                        />
                      </div>

                      <div className="form-actions">
                        <Button variant="secondary" type="button" onClick={cancelAdjust}>
                          Cancel
                        </Button>
                        <Button
                          variant={adjustForm.action === 'add' ? 'success' : 'primary'}
                          type="submit"
                          disabled={adjusting}
                        >
                          {adjusting
                            ? 'Applying...'
                            : adjustForm.action === 'add'
                              ? '➕ Add to Stock'
                              : '➖ Use from Stock'}
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

export default Materials;