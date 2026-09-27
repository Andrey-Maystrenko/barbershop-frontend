import React, { useState, useEffect, useRef } from 'react';
import { useServiceContext } from '../../context/ServiceContext';
import { barberService } from '../../services/barberService';
import BarberSelect from '../../components/forms/BarberSelect';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';
import './Calendar.css';

const Calendar = () => {
  const [barbers, setBarbers] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('09:00');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { updateBarber, updateService, resetService } = useServiceContext();
  const hasFetched = useRef(false);

  useEffect(() => {
    // Prevent double fetch
    if (hasFetched.current) return;
    hasFetched.current = true;

    resetService();

    const fetchBarbers = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('🔍 Fetching barbers...');

        const response = await barberService.getAll();
        console.log('📦 Response from barberService:', response);

        if (response && response.success) {
          console.log('✅ Barbers loaded:', response.data.length);
          setBarbers(response.data);
        } else {
          setError('Failed to fetch barbers: ' + (response?.message || 'Unknown error'));
        }
      } catch (err) {
        console.error('❌ Error fetching barbers:', err);
        setError(`Error connecting to server: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBarbers();

    // Set default date
    const today = new Date().toISOString().split('T')[0];
    setSelectedDate(today);
    updateService({ scheduledDate: today, scheduledTime: '09:00' });
  }, [resetService, updateService]);

  const handleBarberChange = (e) => {
    const barberId = e.target.value
    // console.log("Selected barber:", barberId);
    setSelectedBarber(barberId);
    const barber = barbers.find((b) => b._id === barberId);
    if (barber) {
      updateBarber(barber);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    updateService({ scheduledDate: e.target.value });
  };

  const handleTimeChange = (e) => {
    setSelectedTime(e.target.value);
    updateService({ scheduledTime: e.target.value });
  };

  // const openBarberPage = () => {
  //   if (!selectedBarber) {
  //     alert('Please select a barber');
  //     return;
  //   }
  //   if (!selectedDate) {
  //     alert('Please select a date');
  //     return;
  //   }

  //   const width = 800;
  //   const height = 700;
  //   const left = (window.screen.width - width) / 2;
  //   const top = (window.screen.height - height) / 2;

  //   window.open(
  //     '/barber',
  //     '_blank',
  //     `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
  //   );
  // };

  const openBarberPage = () => {
    if (!selectedBarber) {
      alert('Please select a barber');
      return;
    }
    if (!selectedDate) {
      alert('Please select a date');
      return;
    }

    // Get the selected barber
    const barber = barbers.find((b) => b._id === selectedBarber);
    if (!barber) {
      alert('Barber not found');
      return;
    }

    // Build URL with query parameters
    const params = new URLSearchParams({
      barberId: barber._id,
      barberName: `${barber.firstName} ${barber.lastName}`,
      barberSpecialization: barber.specialization?.join(', ') || '',
      date: selectedDate,
      time: selectedTime,
    });

    const url = `/barber?${params.toString()}`;

    const width = 800;
    const height = 700;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;

    window.open(
      url,
      '_blank',
      `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    );
  };

  if (loading) {
    return (
      <div className="page-container">
        <h1>📅 Select Barber & Date</h1>
        <Loader message="Loading barbers..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <h1>📅 Select Barber & Date</h1>
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
      <h1>📅 Select Barber & Date</h1>
      <p className="subtitle">Choose a barber and schedule your appointment</p>

      <Card title="Barber Selection">
        <BarberSelect
          value={selectedBarber}
          onChange={handleBarberChange}
          barbers={barbers}
        />

        <div className="date-time-row">
          <Input
            label="Date"
            name="date"
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            min={new Date().toISOString().split('T')[0]}
            required
          />
          <Input
            label="Time"
            name="time"
            type="time"
            value={selectedTime}
            onChange={handleTimeChange}
            required
          />
        </div>

        {selectedBarber && (
          <Card variant="success" title="✅ Selected Barber">
            <p>
              <strong>Name:</strong>{' '}
              {barbers.find((b) => b._id === selectedBarber)?.firstName}{' '}
              {barbers.find((b) => b._id === selectedBarber)?.lastName}
            </p>
            <p>
              <strong>Specialization:</strong>{' '}
              {barbers.find((b) => b._id === selectedBarber)?.specialization?.join(', ') || 'N/A'}
            </p>
            <p>
              <strong>Date:</strong> {selectedDate}
            </p>
            <p>
              <strong>Time:</strong> {selectedTime}
            </p>
          </Card>
        )}
      </Card>

      <div className="button-container">
        <Button
          variant="primary"
          onClick={openBarberPage}
          disabled={!selectedBarber || !selectedDate}
        >
          Open Barber Page →
        </Button>
      </div>
    </div>
  );
};

export default Calendar;