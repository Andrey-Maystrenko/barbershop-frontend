import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import './Timetable.css';

const Timetable = () => {
  // const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());

  // ===== Get current month and year =====
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

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
      <div className="calendar-grid">
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
      </div>
    </div>
  );
};

export default Timetable;