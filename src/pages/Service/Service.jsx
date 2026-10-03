import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useServiceContext } from '../../context/ServiceContext';
import { clientService } from '../../services/clientService';
import { materialService } from '../../services/materialService';
import { serviceService } from '../../services/serviceService';
import { operationService } from '../../services/operationService';
import ClientSelect from '../../components/forms/ClientSelect';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import './Service.css';

const Service = () => {
  const [clients, setClients] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [barberData, setBarberData] = useState(null);
  const [hairstyleData, setHairstyleData] = useState(null);
  const [operations, setOperations] = useState([]);           // all available operations
  const [selectedOperations, setSelectedOperations] = useState([]); // array of selected operation IDs

  const location = useLocation();
  const { serviceData, updateService, updateBarber, updateHairstyle, resetService } = useServiceContext();

  const hasProcessedParams = useRef(false);
  const hasFetchedData = useRef(false);

  const [formData, setFormData] = useState({
    clientId: '',
    status: 'pending',
    overhead: 0,
  });

  // ===== MATERIAL QUANTITIES (UI state only) =====
  const [materialQuantities, setMaterialQuantities] = useState({});

  // ===== Process URL params (runs once) =====
  useEffect(() => {
    if (hasProcessedParams.current) return;

    const params = new URLSearchParams(location.search);
    const barberId = params.get('barberId');
    const barberName = params.get('barberName');
    const barberSpecialization = params.get('barberSpecialization');
    const hairstyleId = params.get('hairstyleId');
    const hairstyleName = params.get('hairstyleName');
    const hairstylePrice = parseFloat(params.get('hairstylePrice')) || 0;
    const hairstyleDuration = parseInt(params.get('hairstyleDuration')) || 30;
    const date = params.get('date');
    const time = params.get('time');

    console.log('📥 Service page URL params:', { barberId, hairstyleId, date, time });

    if (!barberId || !hairstyleId) {
      alert('Please complete previous steps first');
      window.close();
      window.open('/', '_blank');
      return;
    }

    const barber = {
      _id: barberId,
      name: barberName || 'Unknown Barber',
      specialization: barberSpecialization ? barberSpecialization.split(', ') : [],
    };
    setBarberData(barber);

    const hairstyle = {
      _id: hairstyleId,
      name: hairstyleName || 'Unknown Hairstyle',
      price: hairstylePrice,
      duration: hairstyleDuration,
    };
    setHairstyleData(hairstyle);

    updateBarber({
      _id: barberId,
      firstName: barberName?.split(' ')[0] || 'Unknown',
      lastName: barberName?.split(' ').slice(1).join(' ') || 'Barber',
      specialization: barberSpecialization ? barberSpecialization.split(', ') : [],
    });

    updateHairstyle({
      _id: hairstyleId,
      name: hairstyleName || 'Unknown Hairstyle',
      price: hairstylePrice,
      duration: hairstyleDuration,
    });

    if (date) updateService({ scheduledDate: date });
    if (time) updateService({ scheduledTime: time });

    hasProcessedParams.current = true;
  }, [location.search, updateBarber, updateHairstyle, updateService]);

  // ===== Fetch clients and materials (runs once) =====
  useEffect(() => {
    if (hasFetchedData.current) return;
    if (!barberData || !hairstyleData) return;

    console.log('🔄 Service page: Starting data fetch...');
    hasFetchedData.current = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('🔍 Service page: Fetching clients and materials...');
        
        const [clientsRes, materialsRes, operationsRes] = await Promise.all([
          clientService.getAll(),
          materialService.getAll(),
          operationService.getAll(),
        ]);

        console.log('📦 Clients response:', clientsRes);
        console.log('📦 Materials response:', materialsRes);

        if (clientsRes.success) setClients(clientsRes.data);
        if (materialsRes.success) setMaterials(materialsRes.data);
        if (operationsRes.success) setOperations(operationsRes.data);
        
        if (!clientsRes.success || !materialsRes.success || !operationsRes.success) {
          setError('Failed to load data');
        }
      } catch (err) {
        console.error('❌ Service page error:', err);
        setError(`Error loading data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [barberData, hairstyleData]);

  // ===== Calculate material total cost =====
  const calculateMaterialTotalCost = () => {
    let total = 0;
    Object.keys(materialQuantities).forEach((materialId) => {
      const quantity = materialQuantities[materialId];
      const numQuantity = parseFloat(quantity);
      if (quantity !== '' && !isNaN(numQuantity) && numQuantity > 0) {
        const material = materials.find((m) => m._id === materialId);
        if (material) {
          total += numQuantity * material.price;
        }
      }
    });
    return total;
  };

  const calculateOperationsTotalCost = () => {
    let total = 0;
    // console.log("selectedOperations", selectedOperations)
    selectedOperations.forEach((opId) => {
      const operation = operations.find((o) => o._id === opId);
      if (operation) {
        total += operation.price;
      }
    })
    return total;
  }

  // ===== Calculate barber cost automatically =====
  const calculateBarberCost = () => {
    const hairstylePrice = hairstyleData?.price || 0;
    const materialCost = calculateMaterialTotalCost();
    const overhead = parseFloat(formData.overhead) || 0;
    // const result = (hairstylePrice - materialCost - overhead) / 2;
    const result = hairstylePrice / 2;
    return result > 0 ? result : 0;
  };

  // ===== Handlers =====
  const handleClientChange = (e) => {
    const clientId = e.target.value;
    setFormData((prev) => ({ ...prev, clientId }));
    const client = clients.find((c) => c._id === clientId);
    if (client) {
      updateService({
        client: {
          _id: client._id,
          name: `${client.firstName} ${client.lastName}`,
          email: client.email,
          phone: client.phone,
        },
      });
    }
  };

  // ===== Material quantity change - JUST UPDATES UI STATE =====
  const handleMaterialQuantityChange = (materialId, value) => {
    setMaterialQuantities((prev) => ({
      ...prev,
      [materialId]: value,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'overhead') {
      updateService({
        costs: {
          ...serviceData.service.costs,
          overhead: parseFloat(value) || 0,
        },
      });
    }

    if (name === 'status') {
      updateService({
        status: value,
      });
    }
  };

  const handleOperationChange = (operationId) => {
  setSelectedOperations((prev) =>
    prev.includes(operationId)
      ? prev.filter((id) => id !== operationId)
      : [...prev, operationId]
  );
};

  // ===== Submit =====
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      if (!formData.clientId) {
        setError('Please select a client');
        setSubmitting(false);
        return;
      }

      // ===== BUILD MATERIALS LIST FROM UI STATE =====
      const selectedMaterials = [];
      let totalMaterialCost = 0;

      Object.keys(materialQuantities).forEach((materialId) => {
        const quantity = materialQuantities[materialId];
        const numQuantity = parseFloat(quantity);
        
        if (quantity !== '' && !isNaN(numQuantity) && numQuantity > 0) {
          const material = materials.find((m) => m._id === materialId);
          if (material) {
            const totalCost = numQuantity * material.price;
            totalMaterialCost += totalCost;
            selectedMaterials.push({
              materialId: material._id,
              name: material.name,
              quantityUsed: numQuantity,
              unit: material.unit,
              costPerUnit: material.price,
              totalCost: totalCost,
            });
          }
        }
      });

      if (selectedMaterials.length === 0) {
        setError('Please select at least one material with quantity > 0');
        setSubmitting(false);
        return;
      }

      // ===== CALCULATE BARBER COST =====
      const hairstylePrice = hairstyleData?.price || 0;
      const overhead = parseFloat(formData.overhead) || 0;
      // const barberCost = (hairstylePrice - totalMaterialCost - overhead) / 2;
      const barberCost = hairstylePrice / 2;
      // Update service with costs
      updateService({
        costs: {
          ...serviceData.service.costs,
          materials: totalMaterialCost,
          barber: barberCost > 0 ? barberCost : 0,
          overhead: overhead,
        },
      });

      const servicePayload = {
        client: {
          _id: serviceData.service.client._id,
          name: serviceData.service.client.name,
          email: serviceData.service.client.email,
          phone: serviceData.service.client.phone,
        },
        barber: {
          _id: serviceData.barber._id,
        },
        hairstyle: {
          _id: serviceData.hairstyle._id,
        },
        operations: selectedOperations.map((opId) => ({ operationId: opId })),
        materials: selectedMaterials.map((m) => ({
          materialId: m.materialId,
          quantityUsed: m.quantityUsed,
        })),
        scheduledDate: serviceData.service.scheduledDate,
        scheduledTime: serviceData.service.scheduledTime,
        pricing: {
          basePrice: serviceData.hairstyle.price || 0,
          discount: 0,
          additionalCharges: [],
          paymentMethod: 'cash',
          paymentStatus: 'pending',
          tip: 0,
        },
        costs: {
          barber: barberCost > 0 ? barberCost : 0,
          overhead: overhead,
          additional: [],
        },
        status: formData.status,
        notes: {
          client: '',
          barber: '',
          internal: '',
        },
      };

      console.log('📤 Sending service payload:', servicePayload);

      const response = await serviceService.create(servicePayload);

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          resetService();
          window.close();
          window.open('/', '_blank');
        }, 3000);
      } else {
        setError(response.message || 'Failed to create service');
      }
    } catch (err) {
      console.error('❌ Error creating service:', err);
      setError(err.response?.data?.message || 'Error creating service');
    } finally {
      setSubmitting(false);
    }
  };

  // ===== Navigation =====
  const goBackToBarber = () => {
    const params = new URLSearchParams({
      barberId: serviceData.barber._id || '',
      barberName: serviceData.barber.name || '',
      barberSpecialization: serviceData.barber.specialization?.join(', ') || '',
      date: serviceData.service.scheduledDate || '',
      time: serviceData.service.scheduledTime || '',
    });
    window.close();
    window.open(`/barber?${params.toString()}`, '_blank');
  };

  // ===== Render =====
  if (!barberData || !hairstyleData) {
    return null;
  }

  if (loading) {
    return (
      <div className="page-container">
        <h1>📋 Complete Service</h1>
        <Loader message="Loading..." />
      </div>
    );
  }

  if (success) {
    return (
      <div className="page-container">
        <div className="success-container">
          <h2>✅ Service Created Successfully!</h2>
          <p>Redirecting to Calendar...</p>
        </div>
      </div>
    );
  }

  // ===== Calculate current values for display =====
  const currentMaterialCost = calculateMaterialTotalCost();
  const currentBarberCost = calculateBarberCost();
  const currentHairstylePrice = hairstyleData?.price || 0;
  const currentOverhead = parseFloat(formData.overhead) || 0;
  const currentOperationsCost = calculateOperationsTotalCost();
  console.log("📦 Current Operations Cost:", currentOperationsCost);
  // const shopProfit = currentHairstylePrice - currentMaterialCost - currentOverhead - currentBarberCost;
  const shopProfit = currentBarberCost;

  return (
    <div className="page-container">
      <h1>📋 Complete Service</h1>
      <p className="subtitle">
        Complete the service details for <strong>{barberData.name}</strong> -{' '}
        <strong>{hairstyleData.name}</strong>
      </p>

      <Card title="Service Summary">
        <div className="summary-grid">
          <div className="summary-item">
            <span className="label">👤 Barber:</span>
            <span className="value">{barberData.name}</span>
          </div>
          <div className="summary-item">
            <span className="label">💇 Hairstyle:</span>
            <span className="value">
              {hairstyleData.name} (${hairstyleData.price})
            </span>
          </div>
          <div className="summary-item">
            <span className="label">📅 Date:</span>
            <span className="value">{serviceData.service.scheduledDate}</span>
          </div>
          <div className="summary-item">
            <span className="label">⏰ Time:</span>
            <span className="value">{serviceData.service.scheduledTime}</span>
          </div>
        </div>
      </Card>

      <form onSubmit={handleSubmit}>
        <Card title="Client & Status">
          <ClientSelect
            value={formData.clientId}
            onChange={handleClientChange}
            clients={clients}
          />

          <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'in-progress', label: 'In Progress' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
          />
        </Card>

        <Card title="Costs">
          <div className="cost-row">
            <div className="cost-display">
              <label>Hairstyle Price</label>
              <div className="cost-value">${currentHairstylePrice.toFixed(2)}</div>
            </div>
            <div className="cost-display">
              <label>Operations Cost</label>
              <div className="cost-value">${currentOperationsCost.toFixed(2)}</div>
            </div>
            <div className="cost-display">
              <label>Materials Cost</label>
              <div className="cost-value">${currentMaterialCost.toFixed(2)}</div>
            </div>
          </div>

          <div className="cost-row">
            <Input
              label="Overhead Cost ($)"
              name="overhead"
              type="number"
              value={formData.overhead}
              onChange={handleInputChange}
              min="0"
              step="0.01"
              placeholder="e.g., 8"
            />
            <div className="cost-display">
              <label>Barber Cost (Auto-calculated)</label>
              <div className="cost-value barber-cost">${currentBarberCost.toFixed(2)}</div>
            </div>
          </div>

          <div className="cost-summary">
            {/* <div className="cost-row-summary">
              <span>Hairstyle Price:</span>
              <span>${currentHairstylePrice.toFixed(2)}</span>
            </div> */}
            <div className="cost-row-summary">
              <span>Operations:</span>
              <span>${currentOperationsCost.toFixed(2)}</span>
            </div>
            <div className="cost-row-summary">
              <span>+ Materials:</span>
              <span>${currentMaterialCost.toFixed(2)}</span>
            </div>
            <div className="cost-row-summary">
              <span>+ Overhead:</span>
              <span>${currentOverhead.toFixed(2)}</span>
            </div>
            <div className="cost-row-summary divider">
              <span>= Total:</span>
              <span>${(currentOperationsCost + currentMaterialCost + currentOverhead).toFixed(2)}</span>
            </div>
            {/* <div className="cost-row-summary highlight">
              <span>👤 Barber (50%):</span>
              <span>${currentBarberCost.toFixed(2)}</span>
            </div>
            <div className="cost-row-summary highlight">
              <span>🏪 Shop (50%):</span>
              <span>${shopProfit.toFixed(2)}</span>
            </div> */}
          </div>
        </Card>

<Card title="Operations">
  <p className="hint">Enter OPERATIONS you want to use in this service</p>
  <div className="operations-list">
    {operations.map((operation) => (
      <div key={operation._id} className="operation-item">
        <span className="operation-name">
          {operation.name} (${operation.price}) - {operation.duration}min
        </span>
        <input
          type="checkbox"
          className="operation-checkbox"
          checked={selectedOperations.includes(operation._id)}
          onChange={() => handleOperationChange(operation._id)}
        />
      </div>
    ))}
  </div>

  {selectedOperations.length > 0 && (
    <div className="selected-operations">
      <h4>Selected Operations:</h4>
      {selectedOperations.map((opId) => {
        const op = operations.find((o) => o._id === opId);
        if (!op) return null;
        return (
          <div key={opId} className="selected-operation">
            <span>
              {op.name} - ${op.price} ({op.duration}min)
            </span>
          </div>
        );
      })}
    </div>
  )}
</Card>

        <Card title="Materials Used">
          <p className="hint">Enter QUANTITIES FOR MATERIALS you want to use in this service</p>
          
          <div className="materials-list">
            {materials.map((material) => (
              <div key={material._id} className="material-item">
                <span className="material-name">
                  {material.name} (${material.price}/{material.unit}) - Available: {material.quantity}
                </span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="material-quantity"
                  placeholder="Qty"
                  value={materialQuantities[material._id] || ''}
                  onChange={(e) => handleMaterialQuantityChange(material._id, e.target.value)}
                />
              </div>
            ))}
          </div>

          {Object.keys(materialQuantities).filter(id => {
            const qty = materialQuantities[id];
            return qty !== '' && parseFloat(qty) > 0;
          }).length > 0 && (
            <div className="selected-materials">
              <h4>Materials to be used in this service:</h4>
              {Object.keys(materialQuantities).map((materialId) => {
                const quantity = materialQuantities[materialId];
                const numQuantity = parseFloat(quantity);
                if (quantity === '' || isNaN(numQuantity) || numQuantity <= 0) return null;
                const material = materials.find((m) => m._id === materialId);
                if (!material) return null;
                return (
                  <div key={materialId} className="selected-material">
                    <span>
                      {material.name} - {numQuantity} {material.unit} (${(numQuantity * material.price).toFixed(2)})
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {error && <div className="error-message">{error}</div>}

        <div className="button-group">
          <Button type="button" variant="secondary" onClick={goBackToBarber}>
            ← Back to Barber
          </Button>
          <Button
            type="submit"
            variant="success"
            disabled={submitting}
          >
            {submitting ? 'Creating...' : '✅ Create Service'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Service;

// import React, { useState, useEffect, useRef } from 'react';
// import { useLocation } from 'react-router-dom';
// import { useServiceContext } from '../../context/ServiceContext';
// import { clientService } from '../../services/clientService';
// import { materialService } from '../../services/materialService';
// import { serviceService } from '../../services/serviceService';
// import ClientSelect from '../../components/forms/ClientSelect';
// import Input from '../../components/common/Input';
// import Select from '../../components/common/Select';
// import Button from '../../components/common/Button';
// import Card from '../../components/common/Card';
// import Loader from '../../components/common/Loader';
// import './Service.css';

// const Service = () => {
//   const [clients, setClients] = useState([]);
//   const [materials, setMaterials] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [submitting, setSubmitting] = useState(false);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState(false);
//   const [barberData, setBarberData] = useState(null);
//   const [hairstyleData, setHairstyleData] = useState(null);

//   const location = useLocation();
//   const { serviceData, updateService, updateBarber, updateHairstyle, resetService } = useServiceContext();

//   const hasProcessedParams = useRef(false);
//   const hasFetchedData = useRef(false);

//   const [formData, setFormData] = useState({
//     clientId: '',
//     status: 'pending',
//     barberCost: 0,
//     overheadCost: 0,
//   });

//   // ===== MATERIAL QUANTITIES (UI state only) =====
//   const [materialQuantities, setMaterialQuantities] = useState({});

//   // ===== Process URL params (runs once) =====
//   useEffect(() => {
//     if (hasProcessedParams.current) return;

//     const params = new URLSearchParams(location.search);
//     const barberId = params.get('barberId');
//     const barberName = params.get('barberName');
//     const barberSpecialization = params.get('barberSpecialization');
//     const hairstyleId = params.get('hairstyleId');
//     const hairstyleName = params.get('hairstyleName');
//     const hairstylePrice = parseFloat(params.get('hairstylePrice')) || 0;
//     const hairstyleDuration = parseInt(params.get('hairstyleDuration')) || 30;
//     const date = params.get('date');
//     const time = params.get('time');

//     console.log('📥 Service page URL params:', { barberId, hairstyleId, date, time });

//     if (!barberId || !hairstyleId) {
//       alert('Please complete previous steps first');
//       window.close();
//       window.open('/', '_blank');
//       return;
//     }

//     const barber = {
//       _id: barberId,
//       name: barberName || 'Unknown Barber',
//       specialization: barberSpecialization ? barberSpecialization.split(', ') : [],
//     };
//     setBarberData(barber);

//     const hairstyle = {
//       _id: hairstyleId,
//       name: hairstyleName || 'Unknown Hairstyle',
//       price: hairstylePrice,
//       duration: hairstyleDuration,
//     };
//     setHairstyleData(hairstyle);

//     updateBarber({
//       _id: barberId,
//       firstName: barberName?.split(' ')[0] || 'Unknown',
//       lastName: barberName?.split(' ').slice(1).join(' ') || 'Barber',
//       specialization: barberSpecialization ? barberSpecialization.split(', ') : [],
//     });

//     updateHairstyle({
//       _id: hairstyleId,
//       name: hairstyleName || 'Unknown Hairstyle',
//       price: hairstylePrice,
//       duration: hairstyleDuration,
//     });

//     if (date) updateService({ scheduledDate: date });
//     if (time) updateService({ scheduledTime: time });

//     hasProcessedParams.current = true;
//   }, [location.search, updateBarber, updateHairstyle, updateService]);

//   // ===== Fetch clients and materials (runs once) =====
//   useEffect(() => {
//     if (hasFetchedData.current) return;
//     if (!barberData || !hairstyleData) return;

//     console.log('🔄 Service page: Starting data fetch...');
//     hasFetchedData.current = true;

//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         setError('');
//         console.log('🔍 Service page: Fetching clients and materials...');
        
//         const [clientsRes, materialsRes] = await Promise.all([
//           clientService.getAll(),
//           materialService.getAll(),
//         ]);

//         console.log('📦 Clients response:', clientsRes);
//         console.log('📦 Materials response:', materialsRes);

//         if (clientsRes.success) setClients(clientsRes.data);
//         if (materialsRes.success) setMaterials(materialsRes.data);
        
//         if (!clientsRes.success || !materialsRes.success) {
//           setError('Failed to load data');
//         }
//       } catch (err) {
//         console.error('❌ Service page error:', err);
//         setError(`Error loading data: ${err.message}`);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [barberData, hairstyleData]);

//   // ===== Handlers =====
//   const handleClientChange = (e) => {
//     const clientId = e.target.value;
//     setFormData((prev) => ({ ...prev, clientId }));
//     const client = clients.find((c) => c._id === clientId);
//     if (client) {
//       updateService({
//         client: {
//           _id: client._id,
//           name: `${client.firstName} ${client.lastName}`,
//           email: client.email,
//           phone: client.phone,
//         },
//       });
//     }
//   };

//   // ===== Material quantity change - JUST UPDATES UI STATE =====
//   const handleMaterialQuantityChange = (materialId, value) => {
//     setMaterialQuantities((prev) => ({
//       ...prev,
//       [materialId]: value,
//     }));
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));

//     if (name === 'barberCost') {
//       updateService({
//         costs: {
//           ...serviceData.service.costs,
//           barber: parseFloat(value) || 0,
//         },
//       });
//     }

//     if (name === 'overheadCost') {
//       updateService({
//         costs: {
//           ...serviceData.service.costs,
//           overhead: parseFloat(value) || 0,
//         },
//       });
//     }

//     if (name === 'status') {
//       updateService({
//         status: value,
//       });
//     }
//   };

//   // ===== Submit =====
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setSubmitting(true);
//     setError('');

//     try {
//       if (!formData.clientId) {
//         setError('Please select a client');
//         setSubmitting(false);
//         return;
//       }

//       // ===== BUILD MATERIALS LIST FROM UI STATE =====
//       const selectedMaterials = [];
//       let totalMaterialCost = 0;

//       Object.keys(materialQuantities).forEach((materialId) => {
//         const quantity = materialQuantities[materialId];
//         const numQuantity = parseFloat(quantity);
        
//         // Only include materials with valid positive quantity
//         if (quantity !== '' && !isNaN(numQuantity) && numQuantity > 0) {
//           const material = materials.find((m) => m._id === materialId);
//           if (material) {
//             const totalCost = numQuantity * material.price;
//             totalMaterialCost += totalCost;
//             selectedMaterials.push({
//               materialId: material._id,
//               name: material.name,
//               quantityUsed: numQuantity,
//               unit: material.unit,
//               costPerUnit: material.price,
//               totalCost: totalCost,
//             });
//           }
//         }
//       });

//       if (selectedMaterials.length === 0) {
//         setError('Please select at least one material with quantity > 0');
//         setSubmitting(false);
//         return;
//       }

//       // Update service with material costs
//       updateService({
//         costs: {
//           ...serviceData.service.costs,
//           materials: totalMaterialCost,
//         },
//       });

//       const servicePayload = {
//         client: {
//           _id: serviceData.service.client._id,
//           name: serviceData.service.client.name,
//           email: serviceData.service.client.email,
//           phone: serviceData.service.client.phone,
//         },
//         barber: {
//           _id: serviceData.barber._id,
//         },
//         hairstyle: {
//           _id: serviceData.hairstyle._id,
//         },
//         materials: selectedMaterials.map((m) => ({
//           materialId: m.materialId,
//           quantityUsed: m.quantityUsed,
//         })),
//         scheduledDate: serviceData.service.scheduledDate,
//         scheduledTime: serviceData.service.scheduledTime,
//         pricing: {
//           basePrice: serviceData.hairstyle.price || 0,
//           discount: 0,
//           additionalCharges: [],
//           paymentMethod: 'cash',
//           paymentStatus: 'pending',
//           tip: 0,
//         },
//         costs: {
//           barber: parseFloat(formData.barberCost) || 0,
//           overhead: parseFloat(formData.overheadCost) || 0,
//           additional: [],
//         },
//         status: formData.status,
//         notes: {
//           client: '',
//           barber: '',
//           internal: '',
//         },
//       };

//       console.log('📤 Sending service payload:', servicePayload);

//       const response = await serviceService.create(servicePayload);

//       if (response.success) {
//         setSuccess(true);
//         setTimeout(() => {
//           resetService();
//           window.close();
//           window.open('/', '_blank');
//         }, 3000);
//       } else {
//         setError(response.message || 'Failed to create service');
//       }
//     } catch (err) {
//       console.error('❌ Error creating service:', err);
//       setError(err.response?.data?.message || 'Error creating service');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ===== Navigation =====
//   const goBackToBarber = () => {
//     const params = new URLSearchParams({
//       barberId: serviceData.barber._id || '',
//       barberName: serviceData.barber.name || '',
//       barberSpecialization: serviceData.barber.specialization?.join(', ') || '',
//       date: serviceData.service.scheduledDate || '',
//       time: serviceData.service.scheduledTime || '',
//     });
//     window.close();
//     window.open(`/barber?${params.toString()}`, '_blank');
//   };

//   // ===== Render =====
//   if (!barberData || !hairstyleData) {
//     return null;
//   }

//   if (loading) {
//     return (
//       <div className="page-container">
//         <h1>📋 Complete Service</h1>
//         <Loader message="Loading..." />
//       </div>
//     );
//   }

//   if (success) {
//     return (
//       <div className="page-container">
//         <div className="success-container">
//           <h2>✅ Service Created Successfully!</h2>
//           <p>Redirecting to Calendar...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="page-container">
//       <h1>📋 Complete Service</h1>
//       <p className="subtitle">
//         Complete the service details for <strong>{barberData.name}</strong> -{' '}
//         <strong>{hairstyleData.name}</strong>
//       </p>

//       <Card title="Service Summary">
//         <div className="summary-grid">
//           <div className="summary-item">
//             <span className="label">👤 Barber:</span>
//             <span className="value">{barberData.name}</span>
//           </div>
//           <div className="summary-item">
//             <span className="label">💇 Hairstyle:</span>
//             <span className="value">
//               {hairstyleData.name} (${hairstyleData.price})
//             </span>
//           </div>
//           <div className="summary-item">
//             <span className="label">📅 Date:</span>
//             <span className="value">{serviceData.service.scheduledDate}</span>
//           </div>
//           <div className="summary-item">
//             <span className="label">⏰ Time:</span>
//             <span className="value">{serviceData.service.scheduledTime}</span>
//           </div>
//         </div>
//       </Card>

//       <form onSubmit={handleSubmit}>
//         <Card title="Client & Status">
//           <ClientSelect
//             value={formData.clientId}
//             onChange={handleClientChange}
//             clients={clients}
//           />

//           <Select
//             label="Status"
//             name="status"
//             value={formData.status}
//             onChange={handleInputChange}
//             options={[
//               { value: 'pending', label: 'Pending' },
//               { value: 'in-progress', label: 'In Progress' },
//               { value: 'completed', label: 'Completed' },
//               { value: 'cancelled', label: 'Cancelled' },
//             ]}
//           />
//         </Card>

//         <Card title="Costs">
//           <div className="cost-row">
//             <Input
//               label="Barber Cost ($)"
//               name="barberCost"
//               type="number"
//               value={formData.barberCost}
//               onChange={handleInputChange}
//               min="0"
//               step="0.01"
//               required
//               placeholder="e.g., 20"
//             />
//             <Input
//               label="Overhead Cost ($)"
//               name="overheadCost"
//               type="number"
//               value={formData.overheadCost}
//               onChange={handleInputChange}
//               min="0"
//               step="0.01"
//               placeholder="e.g., 8"
//             />
//           </div>
//         </Card>

//         <Card title="Materials Used">
//           <p className="hint">Enter quantities for materials you want to use in this service</p>
          
//           <div className="materials-list">
//             {materials.map((material) => (
//               <div key={material._id} className="material-item">
//                 <span className="material-name">
//                   {material.name} (${material.price}/{material.unit}) - Available: {material.quantity}
//                 </span>
//                 <input
//                   type="number"
//                   min="0"
//                   step="0.01"
//                   className="material-quantity"
//                   placeholder="Qty"
//                   value={materialQuantities[material._id] || ''}
//                   onChange={(e) => handleMaterialQuantityChange(material._id, e.target.value)}
//                 />
//               </div>
//             ))}
//           </div>

//           {/* Show materials that will be used in the service */}
//           {Object.keys(materialQuantities).filter(id => {
//             const qty = materialQuantities[id];
//             return qty !== '' && parseFloat(qty) > 0;
//           }).length > 0 && (
//             <div className="selected-materials">
//               <h4>Materials to be used in this service:</h4>
//               {Object.keys(materialQuantities).map((materialId) => {
//                 const quantity = materialQuantities[materialId];
//                 const numQuantity = parseFloat(quantity);
//                 if (quantity === '' || isNaN(numQuantity) || numQuantity <= 0) return null;
//                 const material = materials.find((m) => m._id === materialId);
//                 if (!material) return null;
//                 return (
//                   <div key={materialId} className="selected-material">
//                     <span>
//                       {material.name} - {numQuantity} {material.unit} (${(numQuantity * material.price).toFixed(2)})
//                     </span>
//                   </div>
//                 );
//               })}
//             </div>
//           )}
//         </Card>

//         {error && <div className="error-message">{error}</div>}

//         <div className="button-group">
//           <Button type="button" variant="secondary" onClick={goBackToBarber}>
//             ← Back to Barber
//           </Button>
//           <Button
//             type="submit"
//             variant="success"
//             disabled={submitting}
//           >
//             {submitting ? 'Creating...' : '✅ Create Service'}
//           </Button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default Service;