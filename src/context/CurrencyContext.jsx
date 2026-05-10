import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const CurrencyContext = createContext({ currency: 'PHP', setCurrency: () => {} });

export function CurrencyProvider({ children }) {
  const [currency, setCurrencyState] = useState(() => {
    return localStorage.getItem('defaultCurrency') || 'PHP';
  });

  useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) return; // ← add this

  api.get('/settings').then(r => {
    const cur = r.data?.data?.defaultCurrency;
    if (cur) {
      setCurrencyState(cur);
      localStorage.setItem('defaultCurrency', cur);
    }
  }).catch(() => {});
}, []);

  const setCurrency = async (cur) => {
    await api.put('/settings', { key: 'defaultCurrency', value: cur });
    setCurrencyState(cur);
    localStorage.setItem('defaultCurrency', cur);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export const useCurrency = () => useContext(CurrencyContext);