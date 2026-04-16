export default {
  name: 'wholesaleElectronics',
  title: 'Wholesale - RUGGTECH Electronics',
  type: 'document',
  icon: () => '📱',
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
          { title: 'Rugged Phones', value: 'rugged-phones' },
          { title: 'Tablets', value: 'tablets' },
          { title: 'Smartwatches', value: 'smartwatches' },
          { title: 'Accessories', value: 'accessories' },
          { title: 'Off Grid', value: 'off-grid' },
          { title: 'Audio', value: 'audio' },
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
