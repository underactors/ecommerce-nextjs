'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import styles from './ShippingCalculator.module.css';

const FlagImg = ({ code, size = 20 }) => {
  if (!code) return null;
  const lowerCode = code.toLowerCase();
  return (
    <img
      src={`https://flagcdn.com/w40/${lowerCode}.png`}
      srcSet={`https://flagcdn.com/w80/${lowerCode}.png 2x`}
      width={size}
      height={Math.round(size * 0.75)}
      alt={code}
      style={{ display: 'inline-block', verticalAlign: 'middle', borderRadius: 2, objectFit: 'cover' }}
      loading="lazy"
      onError={(e) => { e.target.style.display = 'none'; }}
    />
  );
};

const COUNTRIES = [
  { code: 'AF', name: 'Afghanistan' },
  { code: 'AL', name: 'Albania' },
  { code: 'DZ', name: 'Algeria' },
  { code: 'AS', name: 'American Samoa' },
  { code: 'AD', name: 'Andorra' },
  { code: 'AO', name: 'Angola' },
  { code: 'AI', name: 'Anguilla' },
  { code: 'AG', name: 'Antigua & Barbuda' },
  { code: 'AR', name: 'Argentina' },
  { code: 'AM', name: 'Armenia' },
  { code: 'AW', name: 'Aruba' },
  { code: 'AU', name: 'Australia' },
  { code: 'AT', name: 'Austria' },
  { code: 'AZ', name: 'Azerbaijan' },
  { code: 'BS', name: 'Bahamas' },
  { code: 'BH', name: 'Bahrain' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'BB', name: 'Barbados' },
  { code: 'BY', name: 'Belarus' },
  { code: 'BE', name: 'Belgium' },
  { code: 'BZ', name: 'Belize' },
  { code: 'BJ', name: 'Benin' },
  { code: 'BM', name: 'Bermuda' },
  { code: 'BT', name: 'Bhutan' },
  { code: 'BO', name: 'Bolivia' },
  { code: 'BA', name: 'Bosnia & Herzegovina' },
  { code: 'BW', name: 'Botswana' },
  { code: 'BR', name: 'Brazil' },
  { code: 'BN', name: 'Brunei' },
  { code: 'BG', name: 'Bulgaria' },
  { code: 'BF', name: 'Burkina Faso' },
  { code: 'BI', name: 'Burundi' },
  { code: 'KH', name: 'Cambodia' },
  { code: 'CM', name: 'Cameroon' },
  { code: 'CA', name: 'Canada' },
  { code: 'CV', name: 'Cape Verde' },
  { code: 'KY', name: 'Cayman Islands' },
  { code: 'CF', name: 'Central African Republic' },
  { code: 'TD', name: 'Chad' },
  { code: 'CL', name: 'Chile' },
  { code: 'CN', name: 'China' },
  { code: 'CO', name: 'Colombia' },
  { code: 'KM', name: 'Comoros' },
  { code: 'CG', name: 'Congo' },
  { code: 'CD', name: 'Congo (DRC)' },
  { code: 'CK', name: 'Cook Islands' },
  { code: 'CR', name: 'Costa Rica' },
  { code: 'CI', name: "Cote d'Ivoire" },
  { code: 'HR', name: 'Croatia' },
  { code: 'CU', name: 'Cuba' },
  { code: 'CW', name: 'Curacao' },
  { code: 'CY', name: 'Cyprus' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'DK', name: 'Denmark' },
  { code: 'DJ', name: 'Djibouti' },
  { code: 'DM', name: 'Dominica' },
  { code: 'DO', name: 'Dominican Republic' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'EG', name: 'Egypt' },
  { code: 'SV', name: 'El Salvador' },
  { code: 'GQ', name: 'Equatorial Guinea' },
  { code: 'ER', name: 'Eritrea' },
  { code: 'EE', name: 'Estonia' },
  { code: 'SZ', name: 'Eswatini' },
  { code: 'ET', name: 'Ethiopia' },
  { code: 'FK', name: 'Falkland Islands' },
  { code: 'FO', name: 'Faroe Islands' },
  { code: 'FJ', name: 'Fiji' },
  { code: 'FI', name: 'Finland' },
  { code: 'FR', name: 'France' },
  { code: 'GF', name: 'French Guiana' },
  { code: 'PF', name: 'French Polynesia' },
  { code: 'GA', name: 'Gabon' },
  { code: 'GM', name: 'Gambia' },
  { code: 'GE', name: 'Georgia' },
  { code: 'DE', name: 'Germany' },
  { code: 'GH', name: 'Ghana' },
  { code: 'GI', name: 'Gibraltar' },
  { code: 'GR', name: 'Greece' },
  { code: 'GL', name: 'Greenland' },
  { code: 'GD', name: 'Grenada' },
  { code: 'GP', name: 'Guadeloupe' },
  { code: 'GU', name: 'Guam' },
  { code: 'GT', name: 'Guatemala' },
  { code: 'GG', name: 'Guernsey' },
  { code: 'GN', name: 'Guinea' },
  { code: 'GW', name: 'Guinea-Bissau' },
  { code: 'GY', name: 'Guyana' },
  { code: 'HT', name: 'Haiti' },
  { code: 'HN', name: 'Honduras' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'HU', name: 'Hungary' },
  { code: 'IS', name: 'Iceland' },
  { code: 'IN', name: 'India' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'IR', name: 'Iran' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'IE', name: 'Ireland' },
  { code: 'IM', name: 'Isle of Man' },
  { code: 'IL', name: 'Israel' },
  { code: 'IT', name: 'Italy' },
  { code: 'JM', name: 'Jamaica' },
  { code: 'JP', name: 'Japan' },
  { code: 'JE', name: 'Jersey' },
  { code: 'JO', name: 'Jordan' },
  { code: 'KZ', name: 'Kazakhstan' },
  { code: 'KE', name: 'Kenya' },
  { code: 'KI', name: 'Kiribati' },
  { code: 'KW', name: 'Kuwait' },
  { code: 'KG', name: 'Kyrgyzstan' },
  { code: 'LA', name: 'Laos' },
  { code: 'LV', name: 'Latvia' },
  { code: 'LB', name: 'Lebanon' },
  { code: 'LS', name: 'Lesotho' },
  { code: 'LR', name: 'Liberia' },
  { code: 'LY', name: 'Libya' },
  { code: 'LI', name: 'Liechtenstein' },
  { code: 'LT', name: 'Lithuania' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'MO', name: 'Macau' },
  { code: 'MG', name: 'Madagascar' },
  { code: 'MW', name: 'Malawi' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'MV', name: 'Maldives' },
  { code: 'ML', name: 'Mali' },
  { code: 'MT', name: 'Malta' },
  { code: 'MH', name: 'Marshall Islands' },
  { code: 'MQ', name: 'Martinique' },
  { code: 'MR', name: 'Mauritania' },
  { code: 'MU', name: 'Mauritius' },
  { code: 'YT', name: 'Mayotte' },
  { code: 'MX', name: 'Mexico' },
  { code: 'FM', name: 'Micronesia' },
  { code: 'MD', name: 'Moldova' },
  { code: 'MC', name: 'Monaco' },
  { code: 'MN', name: 'Mongolia' },
  { code: 'ME', name: 'Montenegro' },
  { code: 'MS', name: 'Montserrat' },
  { code: 'MA', name: 'Morocco' },
  { code: 'MZ', name: 'Mozambique' },
  { code: 'MM', name: 'Myanmar' },
  { code: 'NA', name: 'Namibia' },
  { code: 'NR', name: 'Nauru' },
  { code: 'NP', name: 'Nepal' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'NC', name: 'New Caledonia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'NI', name: 'Nicaragua' },
  { code: 'NE', name: 'Niger' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'NU', name: 'Niue' },
  { code: 'NF', name: 'Norfolk Island' },
  { code: 'KP', name: 'North Korea' },
  { code: 'MK', name: 'North Macedonia' },
  { code: 'NO', name: 'Norway' },
  { code: 'OM', name: 'Oman' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'PW', name: 'Palau' },
  { code: 'PS', name: 'Palestine' },
  { code: 'PA', name: 'Panama' },
  { code: 'PG', name: 'Papua New Guinea' },
  { code: 'PY', name: 'Paraguay' },
  { code: 'PE', name: 'Peru' },
  { code: 'PH', name: 'Philippines' },
  { code: 'PL', name: 'Poland' },
  { code: 'PT', name: 'Portugal' },
  { code: 'PR', name: 'Puerto Rico' },
  { code: 'QA', name: 'Qatar' },
  { code: 'RE', name: 'Reunion' },
  { code: 'RO', name: 'Romania' },
  { code: 'RU', name: 'Russia' },
  { code: 'RW', name: 'Rwanda' },
  { code: 'BL', name: 'Saint Barthelemy' },
  { code: 'SH', name: 'Saint Helena' },
  { code: 'KN', name: 'Saint Kitts & Nevis' },
  { code: 'LC', name: 'Saint Lucia' },
  { code: 'MF', name: 'Saint Martin' },
  { code: 'PM', name: 'Saint Pierre & Miquelon' },
  { code: 'VC', name: 'Saint Vincent & Grenadines' },
  { code: 'WS', name: 'Samoa' },
  { code: 'SM', name: 'San Marino' },
  { code: 'ST', name: 'Sao Tome & Principe' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'SN', name: 'Senegal' },
  { code: 'RS', name: 'Serbia' },
  { code: 'SC', name: 'Seychelles' },
  { code: 'SL', name: 'Sierra Leone' },
  { code: 'SG', name: 'Singapore' },
  { code: 'SX', name: 'Sint Maarten' },
  { code: 'SK', name: 'Slovakia' },
  { code: 'SI', name: 'Slovenia' },
  { code: 'SB', name: 'Solomon Islands' },
  { code: 'SO', name: 'Somalia' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'KR', name: 'South Korea' },
  { code: 'SS', name: 'South Sudan' },
  { code: 'ES', name: 'Spain' },
  { code: 'LK', name: 'Sri Lanka' },
  { code: 'SD', name: 'Sudan' },
  { code: 'SR', name: 'Suriname' },
  { code: 'SE', name: 'Sweden' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'SY', name: 'Syria' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'TJ', name: 'Tajikistan' },
  { code: 'TZ', name: 'Tanzania' },
  { code: 'TH', name: 'Thailand' },
  { code: 'TL', name: 'Timor-Leste' },
  { code: 'TG', name: 'Togo' },
  { code: 'TK', name: 'Tokelau' },
  { code: 'TO', name: 'Tonga' },
  { code: 'TT', name: 'Trinidad & Tobago' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'TR', name: 'Turkey' },
  { code: 'TM', name: 'Turkmenistan' },
  { code: 'TC', name: 'Turks & Caicos Islands' },
  { code: 'TV', name: 'Tuvalu' },
  { code: 'UG', name: 'Uganda' },
  { code: 'UA', name: 'Ukraine' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'US', name: 'United States' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'UZ', name: 'Uzbekistan' },
  { code: 'VU', name: 'Vanuatu' },
  { code: 'VA', name: 'Vatican City' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'VG', name: 'Virgin Islands (British)' },
  { code: 'VI', name: 'Virgin Islands (U.S.)' },
  { code: 'WF', name: 'Wallis & Futuna' },
  { code: 'EH', name: 'Western Sahara' },
  { code: 'YE', name: 'Yemen' },
  { code: 'ZM', name: 'Zambia' },
  { code: 'ZW', name: 'Zimbabwe' },
];

const CARRIER_DISPLAY = {
  'usps': 'USPS',
  'fedex': 'FedEx',
  'ups': 'UPS',
  'dhl_express': 'DHL Express',
  'dhl_ecommerce': 'DHL eCommerce',
  'aramex': 'Aramex',
  'singpost': 'Singapore Post',
};

const CARRIER_COLORS = {
  'usps': '#333366',
  'fedex': '#4D148C',
  'ups': '#351c15',
  'dhl_express': '#D40511',
  'dhl_ecommerce': '#D40511',
  'aramex': '#E2231A',
  'singpost': '#E4002B',
};

function CountryDropdown({ value, onChange, className }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const wrapRef = useRef(null);
  const searchRef = useRef(null);
  const listRef = useRef(null);

  const selected = COUNTRIES.find(c => c.code === value);
  const filtered = search
    ? COUNTRIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()))
    : COUNTRIES;

  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open]);

  const handleSelect = (code) => {
    onChange(code);
    setOpen(false);
    setSearch('');
  };

  return (
    <div className={`${styles.customDropdown} ${className || ''}`} ref={wrapRef}>
      <button
        type="button"
        className={styles.dropdownTrigger}
        onClick={() => setOpen(!open)}
      >
        <span className={styles.dropdownValue}>
          {selected ? (
            <><FlagImg code={selected.code} size={20} /> {selected.name}</>
          ) : (
            'Select Country'
          )}
        </span>
        <i className={`fas fa-chevron-${open ? 'up' : 'down'} ${styles.dropdownArrow}`}></i>
      </button>

      {open && (
        <div className={styles.dropdownPanel}>
          <div className={styles.dropdownSearchWrap}>
            <i className="fas fa-search"></i>
            <input
              ref={searchRef}
              className={styles.dropdownSearch}
              type="text"
              placeholder="Search country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <ul className={styles.dropdownList} ref={listRef}>
            {filtered.length === 0 && (
              <li className={styles.dropdownNoResult}>No countries found</li>
            )}
            {filtered.map(c => (
              <li
                key={c.code}
                className={`${styles.dropdownItem} ${c.code === value ? styles.dropdownItemActive : ''}`}
                onClick={() => handleSelect(c.code)}
              >
                <span className={styles.dropdownFlag}><FlagImg code={c.code} size={20} /></span>
                <span>{c.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function ShippingCalculator({
  items,
  product,
  onShippingSelect,
  selectedRate,
  mode = 'product',
}) {
  const [country, setCountry] = useState('');
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [parcelInfo, setParcelInfo] = useState(null);
  const [showAllMethods, setShowAllMethods] = useState(false);
  const cheapestRate = rates.length > 0 ? rates[0] : null;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCountry = sessionStorage.getItem('shippingCountry');
      if (storedCountry) {
        setCountry(storedCountry);
      }
    }
  }, []);

  const fetchRates = useCallback(async (selectedCountry) => {
    if (!selectedCountry) return;

    setLoading(true);
    setError('');
    setRates([]);
    setShowAllMethods(false);

    const itemsPayload = product
      ? [{
          contentType: product._type || product.category || '',
          quantity: 1,
          shippingWeightKg: product.shippingWeightKg || null,
          shippingLengthCm: product.shippingLengthCm || null,
          shippingWidthCm: product.shippingWidthCm || null,
          shippingHeightCm: product.shippingHeightCm || null,
        }]
      : (items || []).map(item => ({
          contentType: item.contentType || item.category || item._type || '',
          quantity: item.quantity || 1,
          shippingWeightKg: item.shippingWeightKg || null,
          shippingLengthCm: item.shippingLengthCm || null,
          shippingWidthCm: item.shippingWidthCm || null,
          shippingHeightCm: item.shippingHeightCm || null,
        }));

    try {
      const res = await fetch('/api/shipping/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          country: selectedCountry,
          items: itemsPayload,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to get shipping rates');
        return;
      }

      setRates(data.rates || []);
      setParcelInfo(data.parcelInfo);

      if (data.rates?.length === 0) {
        setError('No shipping options available for this destination.');
      }

      if (mode === 'cart' && data.rates?.length > 0) {
        setShowAllMethods(true);
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [product, items, mode]);

  const handleCountryChange = (e) => {
    const val = e.target.value;
    setCountry(val);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('shippingCountry', val);
    }
    if (val) {
      fetchRates(val);
    } else {
      setRates([]);
      setParcelInfo(null);
      setError('');
    }
  };

  const handleSelectRate = (rate) => {
    if (onShippingSelect) {
      const selected = {
        id: rate.id,
        provider: rate.provider,
        serviceName: rate.serviceName,
        amount: rate.amount,
        currency: rate.currency,
        estimatedDays: rate.estimatedDays,
      };
      onShippingSelect(selected);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('selectedShipping', JSON.stringify(selected));
      }
    }
  };

  const getCarrierName = (provider) => {
    return CARRIER_DISPLAY[provider?.toLowerCase()] || provider || 'Carrier';
  };

  const getCarrierColor = (provider) => {
    return CARRIER_COLORS[provider?.toLowerCase()] || '#6366f1';
  };

  const countryName = COUNTRIES.find(c => c.code === country)?.name || '';

  if (mode === 'product') {
    return (
      <div className={styles.inlineWrap}>
        <div className={styles.inlineRow}>
          <span className={styles.inlineLabel}>Country/Region:</span>
          <CountryDropdown
            value={country}
            onChange={(code) => handleCountryChange({ target: { value: code } })}
            className={styles.inlineDropdownWrap}
          />

          {loading && (
            <span className={styles.inlineLoading}>
              <i className="fas fa-spinner fa-spin"></i>
            </span>
          )}

          {cheapestRate && !loading && (
            <span className={styles.inlineCost}>
              Shipping Cost: <strong>${cheapestRate.amount.toFixed(2)}</strong>
              {' '}by {getCarrierName(cheapestRate.provider)}
            </span>
          )}
        </div>

        {error && (
          <div className={styles.inlineError}>
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        {rates.length > 1 && !loading && (
          <>
            <button
              className={styles.moreMethodsBtn}
              onClick={() => setShowAllMethods(!showAllMethods)}
            >
              <i className="fas fa-truck"></i>
              {showAllMethods ? 'Hide Methods' : `More Methods (${rates.length})`}
              <i className={`fas fa-chevron-${showAllMethods ? 'up' : 'down'}`}></i>
            </button>

            {showAllMethods && (
              <div className={styles.methodsTable}>
                <div className={styles.methodsHeader}>
                  <span></span>
                  <span>Shipping Method</span>
                  <span>Shipping Cost</span>
                  <span>Transit Time</span>
                </div>
                {rates.map((rate, index) => {
                  const isSelected = selectedRate?.id === rate.id;
                  const isCheapest = index === 0;
                  return (
                    <div
                      key={rate.id}
                      className={`${styles.methodRow} ${isSelected ? styles.methodRowSelected : ''}`}
                      onClick={() => handleSelectRate(rate)}
                    >
                      <div className={styles.methodRadio}>
                        <input
                          type="radio"
                          name="shipping-method"
                          checked={isSelected}
                          onChange={() => handleSelectRate(rate)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div className={styles.methodCarrier}>
                        <span
                          className={styles.carrierBadge}
                          style={{
                            background: getCarrierColor(rate.provider),
                            color: '#fff',
                          }}
                        >
                          {getCarrierName(rate.provider)}
                        </span>
                        <span className={styles.methodService}>
                          {rate.serviceName} - ${rate.amount.toFixed(2)}
                          {typeof rate.estimatedDays === 'number' ? ` (${rate.estimatedDays}d)` : ''}
                        </span>
                        {isCheapest && <span className={styles.bestValueBadge}>Best Value</span>}
                      </div>
                      <div className={styles.methodCost}>
                        ${rate.amount.toFixed(2)}
                        <span className={styles.methodCurrency}>{rate.currency}</span>
                      </div>
                      <div className={styles.methodTransit}>
                        {typeof rate.estimatedDays === 'number'
                          ? `${rate.estimatedDays} working days`
                          : rate.estimatedDays || rate.durationTerms || 'Contact carrier'}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <div className={styles.cartWrap}>
      <div className={styles.cartHeader}>
        <i className="fas fa-shipping-fast"></i>
        <h3>Shipping Methods</h3>
      </div>

      <div className={styles.cartCountryRow}>
        <label className={styles.cartLabel}>Country/Region:</label>
        <CountryDropdown
          value={country}
          onChange={(code) => handleCountryChange({ target: { value: code } })}
          className={styles.cartDropdownWrap}
        />
        {parcelInfo && (
          <span className={styles.cartWeight}>
            Act. Wt. {parcelInfo.weightKg?.toFixed(2) || parcelInfo.weight} kg
          </span>
        )}
      </div>

      {loading && (
        <div className={styles.cartLoading}>
          <i className="fas fa-spinner fa-spin"></i>
          Fetching rates from carriers...
        </div>
      )}

      {error && (
        <div className={styles.cartError}>
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      {rates.length > 0 && !loading && (
        <div className={styles.cartTable}>
          <div className={styles.cartTableHeader}>
            <span></span>
            <span>Shipping Method</span>
            <span>Shipping Cost</span>
            <span>Transit Time</span>
          </div>
          {rates.map((rate, index) => {
            const isSelected = selectedRate?.id === rate.id;
            const isCheapest = index === 0;
            const fastestRate = rates.reduce((min, r) => {
              const days = parseInt(r.estimatedDays) || 999;
              const minDays = parseInt(min.estimatedDays) || 999;
              return days < minDays ? r : min;
            }, rates[0]);
            const isFastest = rate.id === fastestRate.id && !isCheapest;

            return (
              <div
                key={rate.id}
                className={`${styles.cartRow} ${isSelected ? styles.cartRowSelected : ''}`}
                onClick={() => handleSelectRate(rate)}
              >
                <div className={styles.cartRadio}>
                  <input
                    type="radio"
                    name="cart-shipping"
                    checked={isSelected}
                    onChange={() => handleSelectRate(rate)}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
                <div className={styles.cartCarrier}>
                  <span
                    className={styles.carrierBadge}
                    style={{
                      background: getCarrierColor(rate.provider),
                      color: '#fff',
                    }}
                  >
                    {getCarrierName(rate.provider)}
                  </span>
                  <span className={styles.cartService}>{rate.serviceName}</span>
                  {isCheapest && <span className={styles.bestValueBadge}>Best Value</span>}
                  {isFastest && <span className={styles.fastestBadge}>Fastest</span>}
                </div>
                <div className={styles.cartCost}>
                  ${rate.amount.toFixed(2)}
                </div>
                <div className={styles.cartTransit}>
                  {typeof rate.estimatedDays === 'number'
                    ? `${rate.estimatedDays} working days`
                    : rate.estimatedDays || rate.durationTerms || 'Contact carrier'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!country && !loading && (
        <div className={styles.cartPrompt}>
          <i className="fas fa-info-circle"></i>
          Select your country to see available shipping methods and costs.
        </div>
      )}
    </div>
  );
}
