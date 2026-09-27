import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useServiceContext } from '../../context/ServiceContext';
import { hairstyleService } from '../../services/hairstyleService';
import HairstyleSelect from '../../components/forms/HairstyleSelect';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import './Barber.css';

const Barber = () => {
  const [hairstyles, setHairstyles] = useState([]);
  const [selectedHairstyle, setSelectedHairstyle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [barberData, setBarberData] = useState(null);
  
  const location = useLocation();
  const { serviceData, updateHairstyle, updateBarber, updateService } = useServiceContext();
  
  // ✅ Use ref to track if data has been fetched (same as Calendar page)
  const hasFetched = useRef(false);
  // ✅ Track if URL params have been processed
  const hasProcessedParams = useRef(false);

  // ===== Process URL params (runs once) =====
  useEffect(() => {
    if (hasProcessedParams.current) return;
    
    const params = new URLSearchParams(location.search);
    const barberId = params.get('barberId');
    const barberName = params.get('barberName');
    const barberSpecialization = params.get('barberSpecialization');
    const date = params.get('date');
    const time = params.get('time');

    console.log('📥 Barber page URL params:', { barberId, barberName, date, time });

    if (!barberId) {
      alert('Please select a barber first on the Calendar page');
      window.close();
      window.open('/', '_blank');
      return;
    }

    // Set barber data
    const barber = {
      _id: barberId,
      name: barberName || 'Unknown Barber',
      specialization: barberSpecialization ? barberSpecialization.split(', ') : [],
    };
    setBarberData(barber);

    // Update context
    updateBarber({
      _id: barberId,
      firstName: barberName?.split(' ')[0] || 'Unknown',
      lastName: barberName?.split(' ').slice(1).join(' ') || 'Barber',
      specialization: barberSpecialization ? barberSpecialization.split(', ') : [],
    });

    if (date) updateService({ scheduledDate: date });
    if (time) updateService({ scheduledTime: time });

    hasProcessedParams.current = true;
  }, [location.search, updateBarber, updateService]);

  // ===== Fetch hairstyles (runs once, like Calendar page) =====
  useEffect(() => {
    // Prevent double fetch
    if (hasFetched.current) return;
    if (!barberData) return; // Wait for barber data to be set

    console.log('🔄 Barber page: Starting hairstyle fetch...');
    hasFetched.current = true;

    const fetchHairstyles = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('🔍 Barber page: Fetching hairstyles...');
        
        const response = await hairstyleService.getAll();
        console.log('📦 Barber page: Hairstyles response:', response);
        
        if (response && response.success) {
          console.log('✅ Hairstyles loaded:', response.data.length);
          setHairstyles(response.data);
        } else {
          setError('Failed to fetch hairstyles: ' + (response?.message || 'Unknown error'));
        }
      } catch (err) {
        console.error('❌ Barber page error:', err);
        setError(`Error connecting to server: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchHairstyles();
  }, [barberData]); // ✅ Only runs when barberData is set

  const handleHairstyleChange = (e) => {
    const hairstyleId = e.target.value;
    setSelectedHairstyle(hairstyleId);
    const hairstyle = hairstyles.find((h) => h._id === hairstyleId);
    if (hairstyle) {
      updateHairstyle(hairstyle);
    }
  };

  const openServicePage = () => {
    if (!selectedHairstyle) {
      alert('Please select a hairstyle');
      return;
    }

    const hairstyle = hairstyles.find((h) => h._id === selectedHairstyle);
    if (!hairstyle) {
      alert('Hairstyle not found');
      return;
    }

    const params = new URLSearchParams({
      barberId: barberData?._id || '',
      barberName: barberData?.name || '',
      barberSpecialization: barberData?.specialization?.join(', ') || '',
      hairstyleId: hairstyle._id,
      hairstyleName: hairstyle.name,
      hairstylePrice: hairstyle.price,
      hairstyleDuration: hairstyle.duration,
      date: serviceData.service.scheduledDate || '',
      time: serviceData.service.scheduledTime || '',
    });

    const url = `/service?${params.toString()}`;

    const width = 900;
    const height = 800;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    window.open(
      url,
      '_blank',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  };

  const goBackToCalendar = () => {
    window.close();
    window.open('/', '_blank');
  };

  if (!barberData) {
    return null;
  }

  if (loading) {
    return (
      <div className="page-container">
        <h1>💇 Select Hairstyle</h1>
        <Loader message="Loading hairstyles..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <h1>💇 Select Hairstyle</h1>
        <div className="error-message">
          <h3>⚠️ Connection Error</h3>
          <p>{error}</p>
          <p style={{ fontSize: '12px', color: '#666' }}>
            Make sure backend is running on port 5000
          </p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '10px', padding: '8px 16px', cursor: 'pointer' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>💇 Select Hairstyle</h1>
      <p className="subtitle">
        Choose a hairstyle for <strong>{barberData.name}</strong>
      </p>

      <Card title="Barber & Appointment Info">
        <div className="info-row">
          <span className="label">Barber:</span>
          <span className="value">{barberData.name}</span>
        </div>
        <div className="info-row">
          <span className="label">Specialization:</span>
          <span className="value">{barberData.specialization?.join(', ') || 'N/A'}</span>
        </div>
        <div className="info-row">
          <span className="label">Date:</span>
          <span className="value">{serviceData.service.scheduledDate}</span>
        </div>
        <div className="info-row">
          <span className="label">Time:</span>
          <span className="value">{serviceData.service.scheduledTime}</span>
        </div>
      </Card>

      <Card title="Hairstyle Selection">
        <HairstyleSelect
          value={selectedHairstyle}
          onChange={handleHairstyleChange}
          hairstyles={hairstyles}
        />

        {selectedHairstyle && (
          <Card variant="success" title="✅ Selected Hairstyle">
            <p>
              <strong>Name:</strong>{' '}
              {hairstyles.find((h) => h._id === selectedHairstyle)?.name}
            </p>
            <p>
              <strong>Category:</strong>{' '}
              {hairstyles.find((h) => h._id === selectedHairstyle)?.category}
            </p>
            <p>
              <strong>Price:</strong> $
              {hairstyles.find((h) => h._id === selectedHairstyle)?.price}
            </p>
            <p>
              <strong>Duration:</strong>{' '}
              {hairstyles.find((h) => h._id === selectedHairstyle)?.duration} minutes
            </p>
          </Card>
        )}
      </Card>

      <div className="button-group">
        <Button variant="secondary" onClick={goBackToCalendar}>
          ← Back to Calendar
        </Button>
        <Button
          variant="primary"
          onClick={openServicePage}
          disabled={!selectedHairstyle}
        >
          Open Service Page →
        </Button>
      </div>
    </div>
  );
};

export default Barber;