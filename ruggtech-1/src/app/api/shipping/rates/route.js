import { Shippo } from 'shippo';

let shippo;
try {
  shippo = new Shippo({
    apiKeyHeader: process.env.SHIPPO_API_KEY,
  });
} catch (e) {
  console.warn('Shippo SDK init failed, will use estimated rates:', e.message);
}

const WAREHOUSE_ADDRESS = {
  name: 'RUGGTECH Store',
  street1: '123 Main Street',
  city: 'Johannesburg',
  state: 'Gauteng',
  zip: '2000',
  country: 'ZA',
  phone: '+27 11 000 0000',
  email: 'orders@ruggtech.com',
};

const DEFAULT_PARCEL = {
  length: '30',
  width: '25',
  height: '15',
  distanceUnit: 'cm',
  weight: '1',
  massUnit: 'kg',
};

const CATEGORY_PARCELS = {
  ruggedDevice: { length: '20', width: '12', height: '10', distanceUnit: 'cm', weight: '0.7', massUnit: 'kg' },
  phone: { length: '20', width: '12', height: '8', distanceUnit: 'cm', weight: '0.5', massUnit: 'kg' },
  tablet: { length: '30', width: '25', height: '8', distanceUnit: 'cm', weight: '0.9', massUnit: 'kg' },
  suzukiPart: { length: '45', width: '35', height: '25', distanceUnit: 'cm', weight: '3.5', massUnit: 'kg' },
  farmingEquipment: { length: '60', width: '45', height: '35', distanceUnit: 'cm', weight: '7', massUnit: 'kg' },
  accessory: { length: '15', width: '10', height: '8', distanceUnit: 'cm', weight: '0.25', massUnit: 'kg' },
};

const CARRIER_LOGOS = {
  'usps': '/carriers/usps.png',
  'fedex': '/carriers/fedex.png',
  'ups': '/carriers/ups.png',
  'dhl_express': '/carriers/dhl.png',
  'dhl_ecommerce': '/carriers/dhl.png',
  'aramex': '/carriers/aramex.png',
};

const AFRICA_COUNTRIES = ['ZA','NG','KE','GH','TZ','UG','ET','EG','MA','DZ','TN','SN','CM','CI','ZW','BW','NA','MZ','ZM','MW','AO','RW','MU','MG','CD','CG','BJ','BF','ML','NE','TD','TG','GA','GQ','ER','DJ','SO','LS','SZ','GM','GW','SL','LR','CV','ST','KM','SC','SS','SD','LY','MR'];
const EUROPE_COUNTRIES = ['GB','DE','FR','IT','ES','NL','BE','AT','CH','SE','NO','DK','FI','PT','IE','PL','CZ','RO','HU','GR','BG','HR','SK','SI','EE','LV','LT','LU','MT','CY','IS','LI','MC','SM','VA','AD','AL','BA','ME','MK','RS','XK','MD','UA','BY','RU'];
const ASIA_COUNTRIES = ['CN','JP','KR','IN','SG','MY','TH','ID','PH','VN','TW','HK','MO','BD','PK','LK','NP','MM','KH','LA','MN','KZ','UZ','KG','TJ','TM','AF','IR','IQ','SA','AE','QA','KW','BH','OM','JO','LB','IL','PS','SY','YE','GE','AM','AZ'];
const NA_COUNTRIES = ['US','CA','MX'];
const SA_COUNTRIES = ['BR','AR','CL','CO','PE','EC','VE','UY','PY','BO','GY','SR','GF'];
const OCEANIA_COUNTRIES = ['AU','NZ','FJ','PG','WS','TO','VU','SB','KI','MH','FM','PW','NR','TV','CK','NU','TK'];

function getRegion(countryCode) {
  const cc = countryCode.toUpperCase();
  if (cc === 'ZA') return 'domestic';
  if (AFRICA_COUNTRIES.includes(cc)) return 'africa';
  if (EUROPE_COUNTRIES.includes(cc)) return 'europe';
  if (ASIA_COUNTRIES.includes(cc)) return 'asia';
  if (NA_COUNTRIES.includes(cc)) return 'north_america';
  if (SA_COUNTRIES.includes(cc)) return 'south_america';
  if (OCEANIA_COUNTRIES.includes(cc)) return 'oceania';
  return 'international';
}

const REGION_BASE_RATES = {
  domestic:       { economy: 5.99,  standard: 8.99,  express: 14.99, dhl: 19.99, fedex: 24.99 },
  africa:         { economy: 12.99, standard: 18.99, express: 29.99, dhl: 34.99, fedex: 39.99 },
  europe:         { economy: 19.99, standard: 29.99, express: 44.99, dhl: 49.99, fedex: 54.99 },
  north_america:  { economy: 22.99, standard: 34.99, express: 49.99, dhl: 54.99, fedex: 59.99 },
  south_america:  { economy: 24.99, standard: 36.99, express: 52.99, dhl: 57.99, fedex: 62.99 },
  asia:           { economy: 18.99, standard: 27.99, express: 42.99, dhl: 47.99, fedex: 52.99 },
  oceania:        { economy: 24.99, standard: 37.99, express: 54.99, dhl: 59.99, fedex: 64.99 },
  international:  { economy: 24.99, standard: 37.99, express: 54.99, dhl: 59.99, fedex: 64.99 },
};

const REGION_TRANSIT_DAYS = {
  domestic:       { economy: '5-8',   standard: '3-5',  express: '1-2',  dhl: '1-2',  fedex: '1-2' },
  africa:         { economy: '10-18', standard: '7-12', express: '3-5',  dhl: '2-4',  fedex: '2-4' },
  europe:         { economy: '14-21', standard: '8-14', express: '3-6',  dhl: '3-5',  fedex: '3-5' },
  north_america:  { economy: '14-25', standard: '10-16',express: '4-7',  dhl: '3-5',  fedex: '3-5' },
  south_america:  { economy: '16-28', standard: '10-18',express: '5-8',  dhl: '4-6',  fedex: '4-6' },
  asia:           { economy: '12-22', standard: '8-15', express: '3-6',  dhl: '3-5',  fedex: '3-5' },
  oceania:        { economy: '16-28', standard: '10-18',express: '5-8',  dhl: '4-7',  fedex: '4-7' },
  international:  { economy: '16-28', standard: '10-18',express: '5-8',  dhl: '4-7',  fedex: '4-7' },
};

function generateEstimatedRates(countryCode, parcel) {
  const region = getRegion(countryCode);
  const baseRates = REGION_BASE_RATES[region];
  const transitDays = REGION_TRANSIT_DAYS[region];
  const weightKg = parseFloat(parcel.weight) || 1;

  const weightMultiplier = weightKg <= 0.5 ? 0.8 : weightKg <= 1 ? 1.0 : weightKg <= 3 ? 1.3 : weightKg <= 5 ? 1.6 : weightKg <= 10 ? 2.0 : 2.5;

  const round = (v) => Math.round(v * 100) / 100;

  const rates = [
    {
      id: `est_economy_${countryCode}_${Date.now()}`,
      provider: 'dhl_ecommerce',
      serviceName: 'DHL eCommerce Standard',
      amount: round(baseRates.economy * weightMultiplier),
      currency: 'USD',
      estimatedDays: `${transitDays.economy} business days`,
      durationTerms: `Estimated ${transitDays.economy} business days`,
      carrierLogo: CARRIER_LOGOS['dhl_ecommerce'],
      attributes: ['CHEAPEST'],
      isEstimate: true,
    },
    {
      id: `est_standard_${countryCode}_${Date.now()}`,
      provider: 'dhl_express',
      serviceName: 'DHL Express Worldwide',
      amount: round(baseRates.dhl * weightMultiplier),
      currency: 'USD',
      estimatedDays: `${transitDays.dhl} business days`,
      durationTerms: `Estimated ${transitDays.dhl} business days`,
      carrierLogo: CARRIER_LOGOS['dhl_express'],
      attributes: [],
      isEstimate: true,
    },
    {
      id: `est_fedex_${countryCode}_${Date.now()}`,
      provider: 'fedex',
      serviceName: 'FedEx International Priority',
      amount: round(baseRates.fedex * weightMultiplier),
      currency: 'USD',
      estimatedDays: `${transitDays.fedex} business days`,
      durationTerms: `Estimated ${transitDays.fedex} business days`,
      carrierLogo: CARRIER_LOGOS['fedex'],
      attributes: ['FASTEST'],
      isEstimate: true,
    },
  ];

  if (['north_america'].includes(region)) {
    rates.push({
      id: `est_ups_${countryCode}_${Date.now()}`,
      provider: 'ups',
      serviceName: 'UPS Worldwide Saver',
      amount: round((baseRates.fedex * 0.95) * weightMultiplier),
      currency: 'USD',
      estimatedDays: `${transitDays.fedex} business days`,
      durationTerms: `Estimated ${transitDays.fedex} business days`,
      carrierLogo: CARRIER_LOGOS['ups'],
      attributes: [],
      isEstimate: true,
    });
  }

  if (['africa', 'domestic'].includes(region)) {
    rates.push({
      id: `est_aramex_${countryCode}_${Date.now()}`,
      provider: 'aramex',
      serviceName: 'Aramex International',
      amount: round(baseRates.standard * weightMultiplier),
      currency: 'USD',
      estimatedDays: `${transitDays.standard} business days`,
      durationTerms: `Estimated ${transitDays.standard} business days`,
      carrierLogo: CARRIER_LOGOS['aramex'],
      attributes: [],
      isEstimate: true,
    });
  }

  return rates.sort((a, b) => a.amount - b.amount);
}

function estimateParcel(items) {
  if (!items || items.length === 0) return DEFAULT_PARCEL;

  let totalWeight = 0;
  let maxLength = 0;
  let maxWidth = 0;
  let totalHeight = 0;

  items.forEach(item => {
    const qty = item.quantity || 1;

    if (item.shippingWeightKg && item.shippingWeightKg > 0) {
      totalWeight += item.shippingWeightKg * qty;
      maxLength = Math.max(maxLength, item.shippingLengthCm || 20);
      maxWidth = Math.max(maxWidth, item.shippingWidthCm || 15);
      totalHeight += (item.shippingHeightCm || 10) * qty;
    } else {
      const category = item.contentType || item.category || '';
      const categoryLower = category.toLowerCase();

      let parcel = DEFAULT_PARCEL;
      if (categoryLower.includes('rugged') || categoryLower === 'ruggeddevice' || categoryLower === 'product') {
        parcel = CATEGORY_PARCELS.ruggedDevice;
      } else if (categoryLower.includes('phone')) {
        parcel = CATEGORY_PARCELS.phone;
      } else if (categoryLower.includes('tablet')) {
        parcel = CATEGORY_PARCELS.tablet;
      } else if (categoryLower.includes('suzuki') || categoryLower === 'car') {
        parcel = CATEGORY_PARCELS.suzukiPart;
      } else if (categoryLower.includes('farm') || categoryLower.includes('agri')) {
        parcel = CATEGORY_PARCELS.farmingEquipment;
      } else if (categoryLower.includes('access')) {
        parcel = CATEGORY_PARCELS.accessory;
      }

      totalWeight += parseFloat(parcel.weight) * qty;
      maxLength = Math.max(maxLength, parseFloat(parcel.length));
      maxWidth = Math.max(maxWidth, parseFloat(parcel.width));
      totalHeight += parseFloat(parcel.height) * qty;
    }
  });

  totalHeight = Math.min(totalHeight, 90);

  return {
    length: String(maxLength || 30),
    width: String(maxWidth || 25),
    height: String(totalHeight || 15),
    distanceUnit: 'cm',
    weight: String(Math.max(totalWeight, 0.2)),
    massUnit: 'kg',
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { country, state, city, zip, items } = body;

    if (!country) {
      return Response.json({ error: 'Country is required' }, { status: 400 });
    }

    const parcel = estimateParcel(items);
    let rates = [];
    let usedEstimates = false;

    if (shippo && process.env.SHIPPO_API_KEY) {
      try {
        const addressTo = {
          name: 'Customer',
          street1: 'N/A',
          city: city || 'N/A',
          state: state || '',
          zip: zip || '00000',
          country: country,
        };

        const shipment = await shippo.shipments.create({
          addressFrom: WAREHOUSE_ADDRESS,
          addressTo: addressTo,
          parcels: [parcel],
          async: false,
        });

        rates = (shipment.rates || [])
          .filter(rate => rate.amount && parseFloat(rate.amount) > 0)
          .map(rate => ({
            id: rate.objectId,
            provider: rate.provider,
            serviceName: rate.servicelevel?.name || rate.servicelevel?.token || 'Standard',
            amount: parseFloat(rate.amount),
            currency: rate.currency || 'USD',
            estimatedDays: rate.estimatedDays || rate.durationTerms || 'N/A',
            durationTerms: rate.durationTerms || '',
            carrierLogo: CARRIER_LOGOS[rate.provider?.toLowerCase()] || null,
            attributes: rate.attributes || [],
          }))
          .sort((a, b) => a.amount - b.amount);
      } catch (shippoErr) {
        console.warn('Shippo API error, using estimated rates:', shippoErr.message);
      }
    }

    if (rates.length === 0) {
      rates = generateEstimatedRates(country, parcel);
      usedEstimates = true;
    }

    return Response.json({
      success: true,
      rates,
      usedEstimates,
      parcelInfo: {
        weightKg: parseFloat(parcel.weight),
        weight: parcel.weight + ' ' + parcel.massUnit,
        dimensions: `${parcel.length} x ${parcel.width} x ${parcel.height} ${parcel.distanceUnit}`,
      },
    });
  } catch (error) {
    console.error('Shipping rates error:', error);

    const parcel = estimateParcel([]);
    const country = 'US';
    let fallbackRates = [];
    try {
      const body = await request.clone().json().catch(() => ({}));
      fallbackRates = generateEstimatedRates(body.country || country, parcel);
    } catch {
      fallbackRates = generateEstimatedRates(country, parcel);
    }

    return Response.json({
      success: true,
      rates: fallbackRates,
      usedEstimates: true,
      parcelInfo: {
        weightKg: parseFloat(parcel.weight),
        weight: parcel.weight + ' ' + parcel.massUnit,
        dimensions: `${parcel.length} x ${parcel.width} x ${parcel.height} ${parcel.distanceUnit}`,
      },
    });
  }
}
