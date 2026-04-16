export default {
  name: 'phone',
  title: 'Phone & Tablet',
  type: 'document',
  icon: () => '📱',
  groups: [
    { name: 'colorVariants', title: 'Colors & Variant Images' },
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
      title: 'Name',
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
      description: 'Detailed product description with key features',
    },
    {
      name: 'brand',
      title: 'Brand',
      type: 'string',
    },
    {
      name: 'deviceType',
      title: 'Device Type',
      type: 'string',
      options: {
        list: [
          { title: 'Smartphone', value: 'smartphone' },
          { title: 'Tablet', value: 'tablet' },
        ]
      }
    },
    {
      name: 'mainCamera',
      title: 'Main Camera (MP)',
      type: 'string',
      description: 'e.g., 108MP, 64MP + 8MP Ultra Wide',
    },
    {
      name: 'frontCamera',
      title: 'Front Camera (MP)',
      type: 'string',
      description: 'e.g., 32MP, 16MP',
    },
    {
      name: 'battery',
      title: 'Battery Capacity (mAh)',
      type: 'string',
      description: 'e.g., 5000mAh, 10000mAh',
    },
    {
      name: 'chargingSpeed',
      title: 'Charging Speed',
      type: 'string',
      description: 'e.g., 67W Fast Charging, 33W',
    },
    {
      name: 'processor',
      title: 'Processor',
      type: 'string',
      description: 'e.g., Snapdragon 8 Gen 2, MediaTek Helio G99',
    },
    {
      name: 'osVersion',
      title: 'Operating System',
      type: 'string',
      description: 'e.g., Android 14, iOS 17',
    },
    {
      name: 'screenSize',
      title: 'Screen Size',
      type: 'string',
      description: 'e.g., 6.67", 10.1"',
    },
    {
      name: 'screenResolution',
      title: 'Screen Resolution',
      type: 'string',
      description: 'e.g., 2400 x 1080 FHD+',
    },
    {
      name: 'refreshRate',
      title: 'Refresh Rate',
      type: 'string',
      description: 'e.g., 120Hz, 90Hz',
    },
    {
      name: 'connectivity5G',
      title: '5G Support',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'nfc',
      title: 'NFC Support',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'phoneScreenSize',
      title: 'Phone Screen Size Range',
      type: 'string',
      options: {
        list: [
          { title: '5"-5.5"', value: '5-5.5' },
          { title: '5.5"-6"', value: '5.5-6' },
          { title: '6"-6.5"', value: '6-6.5' },
          { title: '6.5"-7"', value: '6.5-7' },
        ]
      }
    },
    {
      name: 'tabletScreenSize',
      title: 'Tablet Screen Size Range',
      type: 'string',
      options: {
        list: [
          { title: '7"-8"', value: '7-8' },
          { title: '8"-10"', value: '8-10' },
          { title: '10"-12"', value: '10-12' },
          { title: '12"-13"+', value: '12-13-plus' },
        ]
      }
    },
    {
      name: 'storage',
      title: 'Storage Filter',
      type: 'string',
      options: {
        list: [
          { title: '64GB', value: '64gb' },
          { title: '128GB', value: '128gb' },
          { title: '256GB', value: '256gb' },
          { title: '512GB', value: '512gb' },
        ]
      }
    },
    {
      name: 'ram',
      title: 'RAM',
      type: 'string',
      options: {
        list: [
          { title: '2GB', value: '2GB' },
          { title: '4GB', value: '4GB' },
          { title: '6GB', value: '6GB' },
          { title: '8GB', value: '8GB' },
          { title: '12GB', value: '12GB' },
          { title: '16GB', value: '16GB' },
        ],
      },
    },
    {
      name: 'rom',
      title: 'ROM / Storage',
      type: 'string',
      options: {
        list: [
          { title: '32GB', value: '32GB' },
          { title: '64GB', value: '64GB' },
          { title: '128GB', value: '128GB' },
          { title: '256GB', value: '256GB' },
          { title: '512GB', value: '512GB' },
          { title: '1TB', value: '1TB' },
        ],
      },
    },
    {
      name: 'expandableStorage',
      title: 'Expandable Storage',
      type: 'string',
      description: 'e.g., Up to 1TB via MicroSD',
    },
    {
      name: 'dimensions',
      title: 'Dimensions',
      type: 'string',
      description: 'e.g., 164.2 x 75.8 x 8.9mm',
    },
    {
      name: 'weight',
      title: 'Weight',
      type: 'string',
      description: 'e.g., 205g',
    },
    {
      name: 'simType',
      title: 'SIM Type',
      type: 'string',
      description: 'e.g., Dual Nano SIM',
    },
    {
      name: 'wifi',
      title: 'WiFi',
      type: 'string',
      description: 'e.g., WiFi 6',
    },
    {
      name: 'bluetooth',
      title: 'Bluetooth',
      type: 'string',
      description: 'e.g., Bluetooth 5.3',
    },
    {
      name: 'sensors',
      title: 'Sensors',
      type: 'text',
      description: 'List of sensors',
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
            {
              name: 'name',
              title: 'Color Name',
              type: 'string',
              description: 'e.g., Midnight Black, Forest Green',
            },
            {
              name: 'hex',
              title: 'Hex Code',
              type: 'string',
              description: 'e.g., #FF0000, #1A1A2E',
            },
          ],
          preview: {
            select: { title: 'name', subtitle: 'hex' },
          },
        },
      ],
    },
    {
      name: 'featureHighlights',
      title: 'Feature Highlights',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          { name: 'title', title: 'Highlight Title', type: 'string' },
          { name: 'subtitle', title: 'Subtitle', type: 'string' },
          { name: 'image', title: 'Highlight Image', type: 'image', options: { hotspot: true } },
        ]
      }],
      description: 'Visual feature highlights grid',
    },
    {
      name: 'warranty',
      title: 'Warranty',
      type: 'string',
      description: 'e.g., 1 Year Manufacturer Warranty',
    },
    {
      name: 'whatsInTheBox',
      title: "What's In The Box",
      type: 'array',
      of: [{ type: 'string' }],
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
      name: 'inStock',
      title: 'In Stock',
      type: 'boolean',
      initialValue: true,
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
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'brand',
      media: 'image.0',
    },
    prepare(selection) {
      const { title, subtitle, media } = selection;
      return {
        title: title,
        subtitle: subtitle ? `${subtitle}` : 'Phone/Tablet',
        media: media,
      };
    },
  },
}
