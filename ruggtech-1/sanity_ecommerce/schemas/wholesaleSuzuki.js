export default {
  name: 'wholesaleSuzuki',
  title: 'Wholesale - Suzuki Parts',
  type: 'document',
  icon: () => '🚗',
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
          { title: 'Body Parts', value: 'body-parts' },
          { title: 'Engine Parts', value: 'engine-parts' },
          { title: 'Accessories', value: 'accessories' },
          { title: 'Lighting', value: 'lighting' },
          { title: 'Interior', value: 'interior' },
          { title: 'Exterior', value: 'exterior' },
          { title: 'Suspension', value: 'suspension' },
          { title: 'Other', value: 'other' },
        ],
      },
    },
    {
      name: 'vehicleModel',
      title: 'Vehicle Model',
      type: 'string',
      options: {
        list: [
          { title: 'Jimny', value: 'jimny' },
          { title: 'Swift', value: 'swift' },
          { title: 'Vitara', value: 'vitara' },
          { title: 'Alto', value: 'alto' },
          { title: 'Wagon R', value: 'wagon-r' },
          { title: 'Universal', value: 'universal' },
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
