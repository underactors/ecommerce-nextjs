export default {
  name: 'review',
  title: 'Product Reviews',
  type: 'document',
  fields: [
    {
      name: 'productId',
      title: 'Product ID',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'productSlug',
      title: 'Product Slug',
      type: 'string'
    },
    {
      name: 'productType',
      title: 'Product Type',
      type: 'string',
      options: {
        list: [
          { title: 'Product', value: 'product' },
          { title: 'Phone', value: 'phone' },
          { title: 'Suzuki Part', value: 'car' },
          { title: 'AgriTech', value: 'agritechPage' }
        ]
      }
    },
    {
      name: 'customerName',
      title: 'Customer Name',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'customerEmail',
      title: 'Customer Email',
      type: 'string'
    },
    {
      name: 'rating',
      title: 'Rating',
      type: 'number',
      validation: Rule => Rule.required().min(1).max(5)
    },
    {
      name: 'title',
      title: 'Review Title',
      type: 'string'
    },
    {
      name: 'content',
      title: 'Review Content',
      type: 'text',
      validation: Rule => Rule.required().min(10)
    },
    {
      name: 'verified',
      title: 'Verified Purchase',
      type: 'boolean',
      initialValue: false
    },
    {
      name: 'approved',
      title: 'Approved',
      type: 'boolean',
      initialValue: false
    },
    {
      name: 'helpful',
      title: 'Helpful Votes',
      type: 'number',
      initialValue: 0
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime'
    }
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'customerName',
      rating: 'rating'
    },
    prepare({ title, subtitle, rating }) {
      return {
        title: title || 'Untitled Review',
        subtitle: `${subtitle} - ${rating} stars`
      }
    }
  }
}
