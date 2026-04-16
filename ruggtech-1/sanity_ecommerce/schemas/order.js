// schemas/order.js
export default {
  name: 'order',
  title: 'Order',
  type: 'document',
  fields: [
    {
      name: 'orderId',
      title: 'Order ID',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'userId',
      title: 'User ID (Clerk)',
      type: 'string',
      description: 'Clerk user ID for querying orders'
    },
    {
      name: 'customerEmail',
      title: 'Customer Email',
      type: 'string',
      validation: Rule => Rule.required().email()
    },
    {
      name: 'customerName',
      title: 'Customer Name',
      type: 'string'
    },
    {
      name: 'customerPhone',
      title: 'Customer Phone',
      type: 'string'
    },
    {
      name: 'paymentMethod',
      title: 'Payment Method',
      type: 'string',
      options: {
        list: [
          { title: 'Credit Card', value: 'credit_card' },
          { title: 'PayPal', value: 'paypal' },
          { title: 'Google Pay', value: 'google_pay' }
        ]
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'paymentDetails',
      title: 'Payment Details',
      type: 'object',
      fields: [
        {
          name: 'cardLastFour',
          title: 'Card Last Four Digits',
          type: 'string'
        },
        {
          name: 'cardName',
          title: 'Name on Card',
          type: 'string'
        },
        {
          name: 'paypalTransactionId',
          title: 'PayPal Transaction ID',
          type: 'string'
        },
        {
          name: 'paypalPayerId',
          title: 'PayPal Payer ID',
          type: 'string'
        },
        {
          name: 'paypalEmail',
          title: 'PayPal Email',
          type: 'string'
        }
      ]
    },
    {
      name: 'items',
      title: 'Order Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            {
              name: 'id',
              title: 'Product ID',
              type: 'string'
            },
            {
              name: 'name',
              title: 'Product Name',
              type: 'string'
            },
            {
              name: 'price',
              title: 'Unit Price',
              type: 'number'
            },
            {
              name: 'quantity',
              title: 'Quantity',
              type: 'number'
            },
            {
              name: 'total',
              title: 'Item Total',
              type: 'number'
            },
            {
              name: 'imageUrl',
              title: 'Product Image URL',
              type: 'string'
            },
            {
              name: 'slug',
              title: 'Product Slug',
              type: 'string'
            },
            {
              name: 'productType',
              title: 'Product Type',
              type: 'string'
            },
            {
              name: 'color',
              title: 'Selected Color',
              type: 'string'
            }
          ]
        }
      ],
      validation: Rule => Rule.required().min(1)
    },
    {
      name: 'shippingAddress',
      title: 'Shipping Address',
      type: 'object',
      fields: [
        {
          name: 'fullName',
          title: 'Full Name',
          type: 'string'
        },
        {
          name: 'address',
          title: 'Address',
          type: 'string'
        },
        {
          name: 'city',
          title: 'City',
          type: 'string'
        },
        {
          name: 'state',
          title: 'State',
          type: 'string'
        },
        {
          name: 'zipCode',
          title: 'ZIP Code',
          type: 'string'
        },
        {
          name: 'country',
          title: 'Country',
          type: 'string'
        }
      ]
    },
    {
      name: 'billingAddress',
      title: 'Billing Address',
      type: 'object',
      fields: [
        {
          name: 'address',
          title: 'Address',
          type: 'string'
        },
        {
          name: 'city',
          title: 'City',
          type: 'string'
        },
        {
          name: 'state',
          title: 'State',
          type: 'string'
        },
        {
          name: 'zipCode',
          title: 'ZIP Code',
          type: 'string'
        },
        {
          name: 'country',
          title: 'Country',
          type: 'string'
        }
      ]
    },
    {
      name: 'subtotal',
      title: 'Subtotal',
      type: 'number',
      validation: Rule => Rule.required().min(0)
    },
    {
      name: 'tax',
      title: 'Tax Amount',
      type: 'number',
      validation: Rule => Rule.required().min(0)
    },
    {
      name: 'shipping',
      title: 'Shipping Cost',
      type: 'number',
      validation: Rule => Rule.required().min(0)
    },
    {
      name: 'total',
      title: 'Total Amount',
      type: 'number',
      validation: Rule => Rule.required().min(0)
    },
    {
      name: 'status',
      title: 'Order Status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending', value: 'pending' },
          { title: 'Processing', value: 'processing' },
          { title: 'Shipped', value: 'shipped' },
          { title: 'Delivered', value: 'delivered' },
          { title: 'Cancelled', value: 'cancelled' },
          { title: 'Completed', value: 'completed' },
          { title: 'Failed', value: 'failed' }
        ]
      },
      initialValue: 'pending'
    },
    {
      name: 'trackingNumber',
      title: 'Tracking Number',
      type: 'string'
    },
    {
      name: 'notes',
      title: 'Order Notes',
      type: 'text'
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    },
    {
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime'
    }
  ],
  preview: {
    select: {
      title: 'orderId',
      subtitle: 'customerEmail',
      media: 'status'
    },
    prepare({ title, subtitle, media }) {
      return {
        title: `Order: ${title}`,
        subtitle: `${subtitle} - Status: ${media}`,
      }
    }
  },
  orderings: [
    {
      title: 'Created Date, New',
      name: 'createdAtDesc',
      by: [{ field: 'createdAt', direction: 'desc' }]
    },
    {
      title: 'Order ID',
      name: 'orderIdAsc',
      by: [{ field: 'orderId', direction: 'asc' }]
    },
    {
      title: 'Total Amount',
      name: 'totalDesc',
      by: [{ field: 'total', direction: 'desc' }]
    }
  ]
}