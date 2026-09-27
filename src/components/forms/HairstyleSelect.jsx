import React from 'react';
import Select from '../common/Select';

const HairstyleSelect = ({ value, onChange, hairstyles = [], disabled = false }) => {
  const options = hairstyles.map((hairstyle) => ({
    value: hairstyle._id,
    label: `${hairstyle.name} - $${hairstyle.price} (${hairstyle.duration} min)`,
  }));

  return (
    <Select
      label="Select Hairstyle"
      name="hairstyleId"
      value={value}
      onChange={onChange}
      options={options}
      placeholder="-- Choose a hairstyle --"
      required
      disabled={disabled}
    />
  );
};

export default HairstyleSelect;