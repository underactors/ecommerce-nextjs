export default {
  name: 'abandonedCart',
  title: 'Abandoned Cart',
  type: 'document',
  fields: [
    {
      name: 'email',
      title: 'Customer Email',
      type: 'string',
      validation: Rule => Rule.required().email()
    },
    {
      name: 'userId',
      title: 'User ID',
      type: 'string'
    },
    {
      name: 'items',
      title: 'Cart Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'productId', title: 'Product ID', type: 'string' },
            { name: 'name', title: 'Product Name', type: 'string' },
            { name: 'price', title: 'Price', type: 'number' },
            { name: 'quantity', title: 'Quantity', type: 'number' },
            { name: 'imageUrl', title: 'Image URL', type: 'string' }
          ]
        }
      ]
    },
    {
      name: 'totalValue',
      title: 'Total Value',
      type: 'number'
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime'
    },
    {
      name: 'reminderSent',
      title: 'Reminder Sent',
      type: 'boolean',
      initialValue: false
    },
    {
      name: 'reminderSentAt',
      title: 'Reminder Sent At',
      type: 'datetime'
    },
    {
      name: 'recovered',
      title: 'Recovered',
      type: 'boolean',
      initialValue: false
    },
    {
      name: 'recoveredAt',
      title: 'Recovered At',
      type: 'datetime'
    }
  ],
  preview: {
    select: {
      email: 'email',
      total: 'totalValue',
      recovered: 'recovered'
    },
    prepare({ email, total, recovered }) {
      return {
        title: email,
        subtitle: `$${total?.toFixed(2) || '0.00'} - ${recovered ? 'Recovered' : 'Pending'}`
      }
    }
  }
}
