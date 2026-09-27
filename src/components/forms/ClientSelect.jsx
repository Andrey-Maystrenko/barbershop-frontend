import React from 'react';
import Select from '../common/Select';

const ClientSelect = ({ value, onChange, clients = [], disabled = false }) => {
  const options = clients.map((client) => ({
    value: client._id,
    label: `${client.firstName} ${client.lastName} - ${client.email}`,
  }));

  return (
    <Select
      label="Client"
      name="clientId"
      value={value}
      onChange={onChange}
      options={options}
      placeholder="-- Select a client --"
      required
      disabled={disabled}
    />
  );
};

export default ClientSelect;