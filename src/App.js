import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ServiceProvider } from './context/ServiceContext';
import Calendar from './pages/Calendar/Calendar';
import Barber from './pages/Barber/Barber';
import Service from './pages/Service/Service';
import './App.css';

function App() {
  return (
    <Router>
      <ServiceProvider>
        <div className="app">
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Navigate to="/calendar" />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/barber" element={<Barber />} />
              <Route path="/service" element={<Service />} />
            </Routes>
          </main>
        </div>
      </ServiceProvider>
    </Router>
  );
}

export default App;