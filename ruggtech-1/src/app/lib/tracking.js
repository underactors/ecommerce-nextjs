const carriers = [
  {
    name: 'USPS',
    icon: '📮',
    color: '#004B87',
    patterns: [
      /^(94|93|92|94|95)\d{20}$/,
      /^(EA|EC|CP|RA|RB|RC|RD|RE|RF|RG|RH|RI|RJ|RK|RL|RM|RN|RO|RP|RQ|RR|RS|RT|RU|RV|RW|RX|RY|RZ)\d{9}US$/i,
      /^(70|14|23|03)\d{14}$/,
      /^(M0|82)\d{8}$/,
      /^[A-Z]{2}\d{9}US$/i,
      /^420\d{27,31}$/,
    ],
    trackUrl: (num) => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${num}`,
  },
  {
    name: 'FedEx',
    icon: '📦',
    color: '#4D148C',
    patterns: [
      /^\d{12}$/,
      /^\d{15}$/,
      /^\d{20}$/,
      /^\d{22}$/,
    ],
    trackUrl: (num) => `https://www.fedex.com/fedextrack/?trknbr=${num}`,
  },
  {
    name: 'UPS',
    icon: '🟤',
    color: '#351C15',
    patterns: [
      /^1Z[A-Z0-9]{16}$/i,
      /^T\d{10}$/,
      /^(H|K)\d{10}$/,
    ],
    trackUrl: (num) => `https://www.ups.com/track?tracknum=${num}`,
  },
  {
    name: 'DHL',
    icon: '🟡',
    color: '#D40511',
    patterns: [
      /^\d{10}$/,
      /^\d{11}$/,
      /^[A-Z]{3}\d{7}$/i,
      /^JD\d{18}$/i,
      /^\d{10,11}$/,
    ],
    trackUrl: (num) => `https://www.dhl.com/en/express/tracking.html?AWB=${num}`,
  },
  {
    name: 'Aramex',
    icon: '🔶',
    color: '#E44D26',
    patterns: [
      /^\d{10,13}$/,
    ],
    trackUrl: (num) => `https://www.aramex.com/track/results?ShipmentNumber=${num}`,
  },
];

export function detectCarrier(trackingNumber) {
  if (!trackingNumber) return null;
  const cleaned = trackingNumber.replace(/\s+/g, '').trim();

  for (const carrier of carriers) {
    for (const pattern of carrier.patterns) {
      if (pattern.test(cleaned)) {
        return {
          name: carrier.name,
          icon: carrier.icon,
          color: carrier.color,
          trackUrl: carrier.trackUrl(cleaned),
        };
      }
    }
  }

  return {
    name: 'Carrier',
    icon: '📦',
    color: '#3b82f6',
    trackUrl: `https://t.17track.net/en#nums=${cleaned}`,
  };
}

export function getTrackingUrl(trackingNumber) {
  const carrier = detectCarrier(trackingNumber);
  return carrier ? carrier.trackUrl : `https://t.17track.net/en#nums=${trackingNumber}`;
}

export const ORDER_STATUSES = [
  { key: 'pending', label: 'Order Placed', icon: '🛒', description: 'Your order has been received' },
  { key: 'processing', label: 'Processing', icon: '📦', description: 'Your order is being prepared' },
  { key: 'shipped', label: 'Shipped', icon: '🚚', description: 'Your order is on its way' },
  { key: 'delivered', label: 'Delivered', icon: '✅', description: 'Your order has been delivered' },
];

export function getStatusIndex(status) {
  if (!status) return 0;
  const s = status.toLowerCase();
  if (s === 'cancelled') return -1;
  const idx = ORDER_STATUSES.findIndex(st => st.key === s);
  return idx >= 0 ? idx : 0;
}
