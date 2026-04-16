export default {
  name: 'car',
  title: 'Suzuki Part',
  type: 'document',
  icon: () => '🔧',
  groups: [
    { name: 'colorVariants', title: 'Colors & Variant Images' },
    { name: 'shipping', title: 'Shipping Information' },
  ],
  fields: [
    {
      name: 'image',
      title: 'Main Image',
      type: 'array',
      of: [{ type: 'image' }],
      options: { hotspot: true },
    },
    {
      name: 'image2',
      title: 'Image 2',
      type: 'array',
      of: [{ type: 'image' }],
      options: { hotspot: true },
    },
    {
      name: 'image3',
      title: 'Image 3',
      type: 'array',
      of: [{ type: 'image' }],
      options: { hotspot: true },
    },
    {
      name: 'image4',
      title: 'Image 4',
      type: 'array',
      of: [{ type: 'image' }],
      options: { hotspot: true },
    },
    {
      name: 'image5',
      title: 'Image 5',
      type: 'array',
      of: [{ type: 'image' }],
      options: { hotspot: true },
    },
    {
      name: 'image6',
      title: 'Image 6',
      type: 'array',
      of: [{ type: 'image' }],
      options: { hotspot: true },
    },
    {
      name: 'colors',
      title: 'Available Colors',
      type: 'array',
      group: 'colorVariants',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'name', title: 'Color Name', type: 'string', description: 'e.g., Midnight Black, Forest Green' },
            { name: 'hex', title: 'Hex Code', type: 'string', description: 'e.g., #FF0000, #1A1A2E' },
          ],
          preview: { select: { title: 'name', subtitle: 'hex' } },
        },
      ],
    },
    {
      name: 'imagecolour',
      title: 'Color Variant Images – Color 1',
      type: 'array',
      group: 'colorVariants',
      of: [{ type: 'image' }],
      options: { hotspot: true },
    },
    {
      name: 'imagecolour2',
      title: 'Color Variant Images – Color 2',
      type: 'array',
      group: 'colorVariants',
      of: [{ type: 'image' }],
      options: { hotspot: true },
    },
    {
      name: 'imagecolour3',
      title: 'Color Variant Images – Color 3',
      type: 'array',
      group: 'colorVariants',
      of: [{ type: 'image' }],
      options: { hotspot: true },
    },
    {
      name: 'imagecolour4',
      title: 'Color Variant Images – Color 4',
      type: 'array',
      group: 'colorVariants',
      of: [{ type: 'image' }],
      options: { hotspot: true },
    },
    {
      name: 'imagecolour5',
      title: 'Color Variant Images – Color 5',
      type: 'array',
      group: 'colorVariants',
      of: [{ type: 'image' }],
      options: { hotspot: true },
    },
    {
      name: 'imagecolour6',
      title: 'Color Variant Images – Color 6',
      type: 'array',
      group: 'colorVariants',
      of: [{ type: 'image' }],
      options: { hotspot: true },
    },
    {
      name: 'imagecolour7',
      title: 'Color Variant Images – Color 7',
      type: 'array',
      group: 'colorVariants',
      of: [{ type: 'image' }],
      options: { hotspot: true },
    },
    {
      name: 'imagecolour8',
      title: 'Color Variant Images – Color 8',
      type: 'array',
      group: 'colorVariants',
      of: [{ type: 'image' }],
      options: { hotspot: true },
    },
    {
      name: 'imagecolour9',
      title: 'Color Variant Images – Color 9',
      type: 'array',
      group: 'colorVariants',
      of: [{ type: 'image' }],
      options: { hotspot: true },
    },
    {
      name: 'youtubeLink',
      title: 'YouTube Link',
      type: 'string',
    },
    {
      name: 'name',
      title: 'Part Name',
      type: 'string',
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
        maxLength: 90,
      },
    },
    {
      name: 'price',
      title: 'Price',
      type: 'number',
    },
    {
      name: 'originalPrice',
      title: 'Original Price',
      type: 'number',
      description: 'Original price before discount',
    },
    {
      name: 'details',
      title: 'Product Details',
      type: 'text',
      description: 'Detailed part description',
    },
    {
      name: 'brand',
      title: 'Brand',
      type: 'string',
    },
    {
      name: 'partNumber',
      title: 'Part Number / OEM Number',
      type: 'string',
      description: 'Manufacturer part number for cross-referencing',
    },
    {
      name: 'vehicleMake',
      title: 'Vehicle Make',
      type: 'string',
      options: {
        list: [
          { title: 'Suzuki', value: 'suzuki' },
        ]
      },
      initialValue: 'suzuki',
    },
    {
      name: 'vehicleModel',
      title: 'Vehicle Model',
      type: 'string',
      options: {
        list: [
          { title: 'Jimny', value: 'jimny' },
          { title: 'Grand Vitara', value: 'grand-vitara' },
          { title: 'Vitara', value: 'vitara' },
          { title: 'Swift', value: 'swift' },
          { title: 'Alto', value: 'alto' },
          { title: 'SX4', value: 'sx4' },
          { title: 'Samurai', value: 'samurai' },
          { title: 'Universal / Multiple', value: 'universal' },
        ]
      }
    },
    {
      name: 'yearFrom',
      title: 'Year From',
      type: 'number',
      description: 'Starting year of compatibility (e.g., 2006)',
    },
    {
      name: 'yearTo',
      title: 'Year To',
      type: 'number',
      description: 'Ending year of compatibility (e.g., 2013)',
    },
    {
      name: 'year',
      title: 'Year Range (Legacy)',
      type: 'string',
      options: {
        list: [
          { title: '2019-2024', value: '2019-2024' },
          { title: '2012-2018', value: '2012-2018' },
          { title: '2006-2011', value: '2006-2011' },
          { title: '1998-2005', value: '1998-2005' },
        ]
      }
    },
    {
      name: 'partCategory',
      title: 'Part Category',
      type: 'string',
      options: {
        list: [
          { title: 'Engine', value: 'engine' },
          { title: 'Suspension', value: 'suspension' },
          { title: 'Body & Exterior', value: 'body-exterior' },
          { title: 'Interior', value: 'interior' },
          { title: 'Brakes', value: 'brakes' },
          { title: 'Electrical', value: 'electrical' },
          { title: 'Transmission', value: 'transmission' },
          { title: 'Exhaust', value: 'exhaust' },
          { title: 'Cooling System', value: 'cooling' },
          { title: 'Steering', value: 'steering' },
          { title: 'Lights & Lamps', value: 'lights' },
          { title: 'Wheels & Tires', value: 'wheels' },
          { title: 'Accessories', value: 'accessories' },
        ]
      }
    },
    {
      name: 'condition',
      title: 'Condition',
      type: 'string',
      options: {
        list: [
          { title: 'OEM (Original)', value: 'oem' },
          { title: 'Aftermarket', value: 'aftermarket' },
          { title: 'Refurbished', value: 'refurbished' },
          { title: 'Used - Excellent', value: 'used-excellent' },
          { title: 'Used - Good', value: 'used-good' },
        ]
      }
    },
    {
      name: 'placement',
      title: 'Placement on Vehicle',
      type: 'string',
      options: {
        list: [
          { title: 'Front', value: 'front' },
          { title: 'Rear', value: 'rear' },
          { title: 'Left', value: 'left' },
          { title: 'Right', value: 'right' },
          { title: 'Front Left', value: 'front-left' },
          { title: 'Front Right', value: 'front-right' },
          { title: 'Rear Left', value: 'rear-left' },
          { title: 'Rear Right', value: 'rear-right' },
          { title: 'Top', value: 'top' },
          { title: 'Bottom / Undercarriage', value: 'bottom' },
          { title: 'Interior', value: 'interior' },
          { title: 'Engine Bay', value: 'engine-bay' },
          { title: 'Universal', value: 'universal' },
        ]
      },
      description: 'Where on the vehicle this part is installed',
    },
    {
      name: 'fitmentNotes',
      title: 'Fitment Notes',
      type: 'text',
      description: 'Important installation or compatibility notes',
    },
    {
      name: 'installationDifficulty',
      title: 'Installation Difficulty',
      type: 'string',
      options: {
        list: [
          { title: 'Easy (DIY)', value: 'easy' },
          { title: 'Medium (Some Tools Required)', value: 'medium' },
          { title: 'Hard (Professional Recommended)', value: 'hard' },
        ]
      },
    },
    {
      name: 'material',
      title: 'Material',
      type: 'string',
      description: 'e.g., Steel, Aluminum, Plastic, Rubber',
    },
    {
      name: 'weight',
      title: 'Weight',
      type: 'string',
      description: 'e.g., 2.5 kg',
    },
    {
      name: 'dimensions',
      title: 'Dimensions',
      type: 'string',
      description: 'e.g., 30cm x 20cm x 15cm',
    },
    {
      name: 'warranty',
      title: 'Warranty',
      type: 'string',
      description: 'e.g., 6 Months, 1 Year',
    },
    {
      name: 'whatsInTheBox',
      title: "What's In The Box",
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Items included (e.g., 1x Device, USB-C Cable, Charger, Manual)',
    },
    {
      name: 'quantityPerPack',
      title: 'Quantity Per Pack',
      type: 'number',
      description: 'Number of pieces included (e.g., 2 for a pair)',
      initialValue: 1,
    },
    {
      name: 'crossReference',
      title: 'Cross Reference Numbers',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Alternative part numbers from other brands',
    },
    {
      name: 'keywoards',
      title: 'Keywords',
      type: 'text',
      of: [{ type: 'string' }],
      description: 'Enter keywords for better searchability',
    },
    {
      name: 'id',
      title: 'Id',
      type: 'string',
    },
    {
      name: 'stockQuantity',
      title: 'Stock Quantity',
      type: 'number',
    },
    {
      name: 'subsubcategory',
      title: 'SubsubCategory',
      type: 'string',
    },
    {
      name: 'location',
      title: 'Item Location',
      type: 'string',
      options: {
        list: [
          { title: 'HONG KONG Warehouse', value: 'HK Warehouse' },
          { title: 'TTD Warehouse', value: 'TT Warehouse' },
          { title: 'USA Warehouse', value: 'USA Warehouse' },
          { title: 'WorldWide Shipping', value: 'WorldWide Shipping' },
        ],
      },
    },
    {
      name: 'featured',
      title: 'Featured',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'onSale',
      title: 'On Sale',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'inStock',
      title: 'In Stock',
      type: 'boolean',
      initialValue: true,
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
      subtitle: 'vehicleModel',
      media: 'image.0',
    },
    prepare(selection) {
      const { title, subtitle, media } = selection;
      return {
        title: title,
        subtitle: subtitle ? `Suzuki ${subtitle}` : 'Suzuki Part',
        media: media,
      };
    },
  },
}
