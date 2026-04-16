'use client';

import { createContext, useContext, useState, useEffect } from 'react';

export const CURRENCIES = [
  { code: 'USD', symbol: '$',   name: 'US Dollar',         rate: 1 },
  { code: 'TTD', symbol: 'TT$', name: 'Trinidad Dollar',   rate: 6.79 },
  { code: 'EUR', symbol: '€',   name: 'Euro',              rate: 0.92 },
  { code: 'GBP', symbol: '£',   name: 'British Pound',     rate: 0.79 },
  { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar',   rate: 1.36 },
  { code: 'JMD', symbol: 'J$',  name: 'Jamaican Dollar',   rate: 155.0 },
  { code: 'BBD', symbol: 'Bds$',name: 'Barbadian Dollar',  rate: 2.02 },
];

const CurrencyContext = createContext(null);

export function CurrencyProvider({ children }) {
  const [currency, setCurrency] = useState(CURRENCIES[0]);

  useEffect(() => {
    const saved = localStorage.getItem('ruggtech_currency');
    if (saved) {
      const found = CURRENCIES.find(c => c.code === saved);
      if (found) setCurrency(found);
    }
  }, []);

  const changeCurrency = (code) => {
    const found = CURRENCIES.find(c => c.code === code);
    if (found) {
      setCurrency(found);
      localStorage.setItem('ruggtech_currency', code);
    }
  };

  const formatPrice = (usdPrice) => {
    if (!usdPrice && usdPrice !== 0) return '';
    const converted = parseFloat(usdPrice) * currency.rate;
    return `${currency.symbol}${converted.toFixed(2)}`;
  };

  return (
    <CurrencyContext.Provider value={{ currency, changeCurrency, formatPrice, currencies: CURRENCIES }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error('useCurrency must be used within CurrencyProvider');
  return ctx;
}
