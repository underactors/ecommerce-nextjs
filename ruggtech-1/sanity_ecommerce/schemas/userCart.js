// sanity/schemas/userCart.js - Complete user cart schema for Sanity Studio

export default {
  name: 'userCart',
  title: 'User Shopping Cart',
  type: 'document',
  icon: () => '🛒',
  fields: [
    {
      name: 'userId',
      title: 'User ID (from Clerk)',
      type: 'string',
      validation: Rule => Rule.required(),
      description: 'The unique user ID from Clerk authentication'
    },
    {
      name: 'cartItems',
      title: 'Cart Items',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'cartItem',
          title: 'Cart Item',
          fields: [
            {
              name: 'productId',
              title: 'Product ID',
              type: 'string',
              validation: Rule => Rule.required()
            },
            {
              name: 'internalId',
              title: 'Internal Product ID',
              type: 'string',
              description: 'Internal reference or Sanity document ID'
            },
            {
              name: 'name',
              title: 'Product Name',
              type: 'string',
              validation: Rule => Rule.required()
            },
            {
              name: 'price',
              title: 'Price',
              type: 'number',
              validation: Rule => Rule.required().min(0)
            },
            {
              name: 'quantity',
              title: 'Quantity',
              type: 'number',
              validation: Rule => Rule.required().min(1),
              initialValue: 1
            },
            {
              name: 'imageUrl',
              title: 'Product Image URL',
              type: 'url',
              description: 'URL to the product image'
            },
            {
              name: 'brand',
              title: 'Brand',
              type: 'string'
            },
            {
              name: 'category',
              title: 'Category',
              type: 'string'
            },
            {
              name: 'type',
              title: 'Product Type',
              type: 'string',
              options: {
                list: [
                  { title: 'Rugged Device', value: 'rugged-device' },
                  { title: 'Suzuki Part', value: 'suzuki-part' },
                  { title: 'Accessory', value: 'accessory' },
                  { title: 'General Product', value: 'product' }
                ]
              },
              initialValue: 'product'
            },
            {
              name: 'partNumber',
              title: 'Part Number',
              type: 'string',
              description: 'For Suzuki parts and specific products'
            },
            {
              name: 'compatibility',
              title: 'Compatibility',
              type: 'string',
              description: 'Compatible models/devices'
            },
            {
              name: 'color',
              title: 'Color/Variant',
              type: 'string'
            },
            {
              name: 'features',
              title: 'Key Features',
              type: 'string'
            },
            {
              name: 'inStock',
              title: 'In Stock',
              type: 'boolean',
              initialValue: true
            },
            {
              name: 'addedBy',
              title: 'Added By User',
              type: 'string',
              description: 'User ID who added this item'
            },
            {
              name: 'addedAt',
              title: 'Added At',
              type: 'datetime',
              description: 'When this item was added to cart'
            }
          ],
          preview: {
            select: {
              title: 'name',
              subtitle: 'brand',
              quantity: 'quantity',
              price: 'price',
              media: 'imageUrl'
            },
            prepare(selection) {
              const { title, subtitle, quantity, price } = selection;
              return {
                title: title,
                subtitle: `${subtitle || 'No Brand'} - Qty: ${quantity} - $${price?.toFixed(2) || '0.00'}`
              }
            }
          }
        }
      ]
    },
    {
      name: 'itemCount',
      title: 'Total Items Count',
      type: 'number',
      description: 'Total number of items in cart (sum of quantities)',
      validation: Rule => Rule.min(0)
    },
    {
      name: 'totalValue',
      title: 'Total Cart Value',
      type: 'number',
      description: 'Total value of all items in cart',
      validation: Rule => Rule.min(0)
    },
    {
      name: 'lastUpdated',
      title: 'Last Updated',
      type: 'datetime',
      description: 'When the cart was last modified'
    },
    {
      name: 'sessionInfo',
      title: 'Session Information',
      type: 'object',
      fields: [
        {
          name: 'userAgent',
          title: 'User Agent',
          type: 'string'
        },
        {
          name: 'lastIP',
          title: 'Last IP Address',
          type: 'string'
        },
        {
          name: 'deviceType',
          title: 'Device Type',
          type: 'string',
          options: {
            list: ['desktop', 'mobile', 'tablet', 'unknown']
          }
        }
      ],
      options: {
        collapsible: true,
        collapsed: true
      }
    }
  ],
  orderings: [
    {
      title: 'Last Updated',
      name: 'lastUpdatedDesc',
      by: [{ field: 'lastUpdated', direction: 'desc' }]
    },
    {
      title: 'User ID',
      name: 'userIdAsc',
      by: [{ field: 'userId', direction: 'asc' }]
    },
    {
      title: 'Total Value (High to Low)',
      name: 'totalValueDesc',
      by: [{ field: 'totalValue', direction: 'desc' }]
    }
  ],
  preview: {
    select: {
      userId: 'userId',
      itemCount: 'itemCount',
      totalValue: 'totalValue',
      lastUpdated: 'lastUpdated'
    },
    prepare(selection) {
      const { userId, itemCount, totalValue, lastUpdated } = selection;
      const truncatedUserId = userId ? userId.substring(0, 20) + (userId.length > 20 ? '...' : '') : 'Unknown User';
      const lastUpdatedFormatted = lastUpdated ? new Date(lastUpdated).toLocaleDateString() : 'Never';
      
      return {
        title: `Cart: ${truncatedUserId}`,
        subtitle: `${itemCount || 0} items • $${totalValue?.toFixed(2) || '0.00'} • Updated: ${lastUpdatedFormatted}`,
        media: () => '🛒'
      }
    }
  }
}