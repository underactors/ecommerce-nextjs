export default {
  name: 'offgrid',
  title: 'Off Grid Equipment',
  type: 'document',
  icon: () => '⚡',
  groups: [
    { name: 'shipping', title: 'Shipping Information' },
  ],
  fields: [
    {
      name: 'name',
      title: 'Product Name',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'imageAlt',
      title: 'Image SEO Description',
      type: 'string',
      description: 'Alt text for images.',
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4
    },
    {
      name: 'image',
      title: 'Main Image',
      type: 'array',
      of: [{ type: 'image' }],
      options: { hotspot: true },
      validation: Rule => Rule.required()
    },
    {
      name: 'image2',
      title: 'Image 2',
      type: 'array',
      of: [{ type: 'image' }],
      options: { hotspot: true }
    },
    {
      name: 'image3',
      title: 'Image 3',
      type: 'array',
      of: [{ type: 'image' }],
      options: { hotspot: true }
    },
    {
      name: 'image4',
      title: 'Image 4',
      type: 'array',
      of: [{ type: 'image' }],
      options: { hotspot: true }
    },
    {
      name: 'image5',
      title: 'Image 5',
      type: 'array',
      of: [{ type: 'image' }],
      options: { hotspot: true }
    },
    {
      name: 'image6',
      title: 'Image 6',
      type: 'array',
      of: [{ type: 'image' }],
      options: { hotspot: true }
    },
    {
      name: 'price',
      title: 'Price',
      type: 'number',
      validation: Rule => Rule.required().positive()
    },
    {
      name: 'originalPrice',
      title: 'Original Price',
      type: 'number',
      description: 'Original price if on sale'
    },
    {
      name: 'brand',
      title: 'Brand',
      type: 'string'
    },
    {
      name: 'equipmentType',
      title: 'Equipment Type',
      type: 'string',
      options: {
        list: [
          { title: 'Solar Systems', value: 'solar-systems' },
          { title: 'Power Stations', value: 'power-stations' },
          { title: 'Generators', value: 'generators' },
          { title: 'Batteries', value: 'batteries' },
          { title: 'Inverters', value: 'inverters' },
          { title: 'Charge Controllers', value: 'charge-controllers' },
          { title: 'Solar Panels', value: 'solar-panels' },
          { title: 'Wind Turbines', value: 'wind-turbines' },
        ]
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'powerOutput',
      title: 'Power Output',
      type: 'string',
      description: 'e.g., 2000W, 500W, 3000W Peak',
    },
    {
      name: 'powerSource',
      title: 'Power Source',
      type: 'string',
      options: {
        list: [
          { title: 'Solar', value: 'solar' },
          { title: 'Fuel (Petrol/Diesel)', value: 'fuel' },
          { title: 'LPG', value: 'lpg' },
          { title: 'Hybrid', value: 'hybrid' },
          { title: 'Battery / Electric', value: 'battery' },
          { title: 'Wind', value: 'wind' },
        ]
      }
    },
    {
      name: 'batteryCapacity',
      title: 'Battery Capacity',
      type: 'string',
      description: 'e.g., 1024Wh, 2048Wh, 100Ah',
    },
    {
      name: 'batteryType',
      title: 'Battery Type',
      type: 'string',
      options: {
        list: [
          { title: 'LiFePO4', value: 'lifepo4' },
          { title: 'Lithium-ion', value: 'lithium-ion' },
          { title: 'Lead Acid', value: 'lead-acid' },
          { title: 'AGM', value: 'agm' },
        ]
      }
    },
    {
      name: 'solarInput',
      title: 'Solar Input',
      type: 'string',
      description: 'e.g., Max 400W, MPPT 12-50V',
    },
    {
      name: 'acOutput',
      title: 'AC Output',
      type: 'string',
      description: 'e.g., 2x 120V/15A, Pure Sine Wave',
    },
    {
      name: 'dcOutput',
      title: 'DC Output',
      type: 'string',
      description: 'e.g., 12V/10A Car Port, USB-A, USB-C PD 100W',
    },
    {
      name: 'chargingTime',
      title: 'Charging Time',
      type: 'string',
      description: 'e.g., 2 hours wall, 4 hours solar',
    },
    {
      name: 'weight',
      title: 'Weight',
      type: 'string',
      description: 'e.g., 12.5 kg',
    },
    {
      name: 'dimensions',
      title: 'Dimensions',
      type: 'string',
      description: 'e.g., 400 x 300 x 280mm',
    },
    {
      name: 'operatingTemperature',
      title: 'Operating Temperature',
      type: 'string',
      description: 'e.g., -10°C to 45°C',
    },
    {
      name: 'cycleLife',
      title: 'Cycle Life',
      type: 'string',
      description: 'e.g., 3500+ cycles to 80%',
    },
    {
      name: 'noiseLevel',
      title: 'Noise Level',
      type: 'string',
      description: 'e.g., 55dB (for generators)',
    },
    {
      name: 'solarCompatible',
      title: 'Solar Panel Compatible',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'inStock',
      title: 'In Stock',
      type: 'boolean',
      initialValue: true
    },
    {
      name: 'stockQuantity',
      title: 'Stock Quantity',
      type: 'number'
    },
    {
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false
    },
    {
      name: 'onSale',
      title: 'On Sale',
      type: 'boolean',
      initialValue: false
    },
    {
      name: 'specifications',
      title: 'Additional Specifications',
      type: 'text',
      description: 'Any extra specs not covered above',
    },
    {
      name: 'warranty',
      title: 'Warranty',
      type: 'string'
    },
    {
      name: 'whatsInTheBox',
      title: "What's In The Box",
      type: 'array',
      of: [{ type: 'string' }],
    },
    {
      name: 'shippingWeightKg',
      title: 'Shipping Weight (kg)',
      type: 'number',
      description: 'Package weight in kilograms for shipping calculation',
      group: 'shipping',
    },
    {
      name: 'shippingLengthCm',
      title: 'Package Length (cm)',
      type: 'number',
      description: 'Package length in centimeters',
      group: 'shipping',
    },
    {
      name: 'shippingWidthCm',
      title: 'Package Width (cm)',
      type: 'number',
      description: 'Package width in centimeters',
      group: 'shipping',
    },
    {
      name: 'shippingHeightCm',
      title: 'Package Height (cm)',
      type: 'number',
      description: 'Package height in centimeters',
      group: 'shipping',
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'equipmentType',
      media: 'image.0'
    }
  }
}
