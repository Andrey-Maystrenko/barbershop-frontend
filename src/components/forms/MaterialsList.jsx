import React from 'react';
import Input from '../common/Input';
import './MaterialsList.css';

const MaterialsList = ({ materials, onMaterialChange }) => {
  return (
    <div className="materials-list">
      {materials.map((material) => (
        <div key={material._id} className="material-item">
          <span className="material-name">
            {material.name} (${material.price}/{material.unit})
          </span>
          <Input
            type="number"
            name={`material-${material._id}`}
            value={material.quantity || ''}
            onChange={(e) => onMaterialChange(material._id, e.target.value)}
            min="0"
            step="0.01"
            placeholder="Qty"
            className="material-quantity"
          />
        </div>
      ))}
    </div>
  );
};

export default MaterialsList;