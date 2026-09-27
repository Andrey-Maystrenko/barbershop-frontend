import React from 'react';
import Select from '../common/Select';

const BarberSelect = ({ value, onChange, barbers = [], disabled = false }) => {
  const options = barbers.map((barber) => ({
    value: barber._id,
    label: `${barber.firstName} ${barber.lastName} - ${barber.specialization?.join(', ') || 'No specialization'}`,
  }));

  return (
    <Select
      label="Select Barber"
      name="barberId"
      value={value}
      onChange={onChange}
      options={options}
      placeholder="-- Choose a barber --"
      required
      disabled={disabled}
    />
  );
};

export default BarberSelect;