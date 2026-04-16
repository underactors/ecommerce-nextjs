'use client';

const PRE_SALE_CONFIG = {
  targetCountries: ['ZA', 'NA', 'BW', 'ZW', 'MZ', 'LS', 'SZ', 'MW', 'ZM'],
  countryNames: {
    'ZA': 'South Africa',
    'NA': 'Namibia',
    'BW': 'Botswana',
    'ZW': 'Zimbabwe',
    'MZ': 'Mozambique',
    'LS': 'Lesotho',
    'SZ': 'Eswatini',
    'MW': 'Malawi',
    'ZM': 'Zambia'
  },
  preSaleEndDate: '2026-02-28T23:59:59',
  preSaleTitle: 'Exclusive Pre-Sale Event',
  preSaleDescription: 'Get early access to our newest products at special pre-sale prices. Limited quantities available!'
};

export async function getUserCountry() {
  try {
    const cachedCountry = typeof window !== 'undefined' 
      ? sessionStorage.getItem('userCountry') 
      : null;
    
    if (cachedCountry) {
      return cachedCountry;
    }

    const response = await fetch('https://ipapi.co/json/', {
      cache: 'force-cache'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch location');
    }
    
    const data = await response.json();
    const countryCode = data.country_code || 'US';
    
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('userCountry', countryCode);
    }
    
    return countryCode;
  } catch (error) {
    console.log('Geo detection failed, defaulting to US');
    return 'US';
  }
}

export function isCountryEligibleForPreSale(countryCode) {
  return PRE_SALE_CONFIG.targetCountries.includes(countryCode);
}

export function getCountryName(countryCode) {
  return PRE_SALE_CONFIG.countryNames[countryCode] || countryCode;
}

export function getPreSaleConfig() {
  return PRE_SALE_CONFIG;
}

export function isPreSaleActive() {
  const now = new Date().getTime();
  const endDate = new Date(PRE_SALE_CONFIG.preSaleEndDate).getTime();
  return now < endDate;
}
