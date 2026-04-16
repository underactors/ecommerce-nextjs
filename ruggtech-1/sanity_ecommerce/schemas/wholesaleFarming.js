export default {
  name: 'wholesaleFarming',
  title: 'Wholesale - Precision Farming',
  type: 'document',
  icon: () => '🌾',
  fields: [
    {
      name: 'name',
      title: 'Product Name',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'sku',
      title: 'SKU',
      type: 'string',
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 3,
    },
    {
      name: 'image',
      title: 'Product Image',
      type: 'image',
      options: { hotspot: true },
    },
    {
      name: 'wholesalePrice',
      title: 'Wholesale Price (TT$)',
      type: 'number',
      validation: Rule => Rule.required().min(0),
    },
    {
      name: 'retailPrice',
      title: 'Retail Price (TT$)',
      type: 'number',
      description: 'Optional - shown as reference for resellers',
    },
    {
      name: 'stock',
      title: 'Stock Quantity',
      type: 'number',
      validation: Rule => Rule.required().min(0),
      initialValue: 0,
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Sensors', value: 'sensors' },
          { title: 'Drones', value: 'drones' },
          { title: 'Irrigation', value: 'irrigation' },
          { title: 'Monitoring', value: 'monitoring' },
          { title: 'Tools', value: 'tools' },
          { title: 'Equipment', value: 'equipment' },
          { title: 'GPS & Navigation', value: 'gps-navigation' },
          { title: 'Other', value: 'other' },
        ],
      },
    },
    {
      name: 'minOrderQty',
      title: 'Minimum Order Quantity',
      type: 'number',
      initialValue: 1,
    },
    {
      name: 'isActive',
      title: 'Active in Catalog',
      type: 'boolean',
      initialValue: true,
    },
    {
      name: 'sortOrder',
      title: 'Sort Order',
      type: 'number',
      initialValue: 0,
    },
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'sku',
      media: 'image',
    },
  },
}
