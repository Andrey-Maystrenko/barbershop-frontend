import React, { createContext, useState, useContext } from 'react';
const ServiceContext = createContext();

export const useServiceContext = () => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServiceContext must be used within ServiceProvider');
  }
  return context;
};

const initialState = {
  barber: {
    _id: null,
    name: null,
    specialization: null,
  },
  hairstyle: {
    _id: null,
    name: null,
    category: null,
    price: null,
    duration: null,
  },
  service: {
    client: {
      _id: null,
      name: null,
      email: null,
      phone: null,
    },
    materials: [],
    costs: {
      barber: 0,
      materials: 0,
      overhead: 0,
      additional: [],
    },
    pricing: {
      basePrice: 0,
      discount: 0,
      discountType: 'percentage',
      additionalCharges: [],
      paymentMethod: 'cash',
      paymentStatus: 'pending',
      tip: 0,
    },
    scheduledDate: null,
    scheduledTime: null,
    status: 'pending',
    notes: {
      client: '',
      barber: '',
      internal: '',
    },
  },
};

export const ServiceProvider = ({ children }) => {
  const [serviceData, setServiceData] = useState(initialState);

  const updateBarber = (barber) => {
    console.log('📝 Updating barber:', barber);
    setServiceData((prev) => ({
      ...prev,
      barber: {
        _id: barber._id,
        name: `${barber.firstName} ${barber.lastName}`,
        specialization: barber.specialization,
      },
    }));
  };

  const updateHairstyle = (hairstyle) => {
    console.log('📝 Updating hairstyle:', hairstyle);
    setServiceData((prev) => ({
      ...prev,
      hairstyle: {
        _id: hairstyle._id,
        name: hairstyle.name,
        category: hairstyle.category,
        price: hairstyle.price,
        duration: hairstyle.duration,
      },
      service: {
        ...prev.service,
        pricing: {
          ...prev.service.pricing,
          basePrice: hairstyle.price,
        },
      },
    }));
  };

  const updateService = (service) => {
    console.log('📝 Updating service:', service);
    setServiceData((prev) => ({
      ...prev,
      service: {
        ...prev.service,
        ...service,
      },
    }));
  };

  const resetService = () => {
    console.log('🔄 Resetting service');
    setServiceData(initialState);
  };

  return (
    <ServiceContext.Provider
      value={{
        serviceData,
        updateBarber,
        updateHairstyle,
        updateService,
        resetService,
      }}
    >
      {children}
    </ServiceContext.Provider>
  );
};