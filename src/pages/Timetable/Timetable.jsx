import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import { serviceService } from '../../services/serviceService';
import './Timetable.css';

const Timetable = () => {
  // const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [services, setServices] = useState([]);

  // ===== Get current month and year =====
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  // ===== Fetch services for the visible month =====
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const firstDay = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        const lastDayNum = new Date(year, month + 1, 0).getDate();
        const lastDay = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDayNum).padStart(2, '0')}`;

        console.log('🔍 Fetching services:', firstDay, '→', lastDay);

        const response = await serviceService.getByDateRange(firstDay, lastDay);

        console.log('✅ Services response:', response);

        if (response.success) {
          setServices(response.data);
          console.log(`📦 Loaded ${response.data.length} services for ${month + 1}/${year}`);
        }
      } catch (err) {
        console.error('❌ Error fetching services:', err);
      }
    };

    fetchServices();
  }, [year, month]);

  // ===== Month name =====
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // ===== Navigate months =====
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // ===== Build days array for the grid =====
  const getDaysInMonth = () => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.

    const days = [];

    // Add empty cells for days before the 1st of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const days = getDaysInMonth();

  // ===== Week day headers =====
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // ===== Check if a day is today =====
  const isToday = (day) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  // ===== Get services for a specific day =====
  const getServicesForDay = (day) => {
    if (!day) return [];

    // Build the date string for this day in local format
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    return services.filter((service) => {
      // Extract date portion from the ISO scheduledDate (it's stored as UTC midnight)
      const sDate = new Date(service.scheduledDate);
      const sDateStr = `${sDate.getUTCFullYear()}-${String(sDate.getUTCMonth() + 1).padStart(2, '0')}-${String(sDate.getUTCDate()).padStart(2, '0')}`;
      return sDateStr === dateStr;
    });
  };

  // ===== Format time range (e.g. "19:00-20:30") =====
  const formatTimeRange = (startTime, duration) => {
    if (!startTime || !duration) return '';

    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + duration;

    const endHours = Math.floor(endMinutes / 60) % 24;
    const endMins = endMinutes % 60;

    return `${startTime}-${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
  };

  // ===== Shorten barber name if too long =====
  const shortenName = (name, maxLength = 15) => {
    if (!name) return '';
    return name.length > maxLength ? name.substring(0, maxLength) + '...' : name;
  };

  // ===== Handle "+" button click =====
  const handleAddService = (day) => {
    if (!day) return;

    // Format date as YYYY-MM-DD
    const selectedDate = new Date(year, month, day);
    // const formattedDate = selectedDate.toISOString().split('T')[0];
    // ✅ Format date locally (no UTC conversion)
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // Navigate to Calendar page with the selected date
    // navigate(`/calendar?date=${formattedDate}`);

    // ✅ Open in new full-scale tab
    const url = `${window.location.origin}/calendar?date=${formattedDate}`;

    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

  };

  // ===== Handle delete button click =====
  const handleDeleteService = async (serviceId, e) => {
    // Stop the click from bubbling up to the cell
    e.stopPropagation();

    // Ask for confirmation
    if (!window.confirm('Delete this service?')) {
      return;
    }

    try {
      console.log('🗑️ Deleting service:', serviceId);
      await serviceService.delete(serviceId);
      console.log('✅ Deleted');

      // Remove from local state without refetch
      setServices((prev) => prev.filter((s) => s._id !== serviceId));
    } catch (err) {
      console.error('❌ Error deleting service:', err);
      alert('Failed to delete service');
    }
  };

  // ===== Handle click on a record =====
  const handleOpenService = (serviceId, e) => {
    e.stopPropagation();

    const url = `${window.location.origin}/service?serviceId=${serviceId}`;

    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  return (
    <div className="timetable-page">
      {/* ===== HEADER ===== */}
      <div className="timetable-header">
        <button className="nav-button" onClick={goToPreviousMonth} title="Previous month">
          ←
        </button>

        <div className="month-title">
          <h1>{monthNames[month]} {year}</h1>
          <button className="today-button" onClick={goToToday}>
            Today
          </button>
        </div>

        <button className="nav-button" onClick={goToNextMonth} title="Next month">
          →
        </button>
      </div>

      {/* ===== WEEK DAY HEADERS ===== */}
      <div className="weekdays">
        {weekDays.map((day) => (
          <div key={day} className="weekday">
            {day}
          </div>
        ))}
      </div>

      {/* ===== CALENDAR GRID ===== */}
      {/* <div className="calendar-grid">
        {days.map((day, index) => (
          <div
            key={index}
            className={`day-cell ${!day ? 'empty' : ''} ${isToday(day) ? 'today' : ''}`}
          >
            {day && (
              <>
                <span className="day-number">{day}</span>
                <button
                  className="add-button"
                  onClick={() => handleAddService(day)}
                  title="Add service"
                >
                  +
                </button>
              </>
            )}
          </div>
        ))}
      </div> */}
      <div className="calendar-grid">
        {days.map((day, index) => {
          const dayServices = getServicesForDay(day);

          return (
            <div
              key={index}
              className={`day-cell ${!day ? 'empty' : ''} ${isToday(day) ? 'today' : ''}`}
            >
              {day && (
                <>
                  <div className="day-header">
                    <span className="day-number">{day}</span>
                    <button
                      className="add-button"
                      onClick={() => handleAddService(day)}
                      title="Add service"
                    >
                      +
                    </button>
                  </div>
                  {/* <div className="day-services">
                    {dayServices.map((service) => (
                      <div key={service._id} className="service-record">
                        <span className="service-time">
                          {formatTimeRange(service.scheduledTime, service.duration)}
                        </span>
                        <span className="service-barber">
                          {shortenName(service.barber?.name || 'Unknown')}
                        </span>
                      </div>
                    ))}
                  </div> */}
                  <div className="day-services">
                    {dayServices.map((service) => (
                      // <div key={service._id} className="service-record">
                      <div
                        key={service._id}
                        className="service-record"
                        onClick={(e) => handleOpenService(service._id, e)}
                        style={{ cursor: 'pointer' }}
                      >
                        <span className="service-time">
                          {formatTimeRange(service.scheduledTime, service.duration)}
                        </span>
                        <span className="service-barber">
                          {shortenName(service.barber?.name || 'Unknown')}
                        </span>
                        <button
                          className="delete-record-button"
                          onClick={(e) => handleDeleteService(service._id, e)}
                          title="Delete service"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Timetable;