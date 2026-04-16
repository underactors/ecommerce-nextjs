export default {
  name: 'subscriber',
  title: 'Email Subscribers',
  type: 'document',
  fields: [
    {
      name: 'email',
      title: 'Email',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'source',
      title: 'Source',
      type: 'string',
      options: {
        list: [
          { title: 'Exit Intent Popup', value: 'exit-intent' },
          { title: 'Footer Newsletter', value: 'footer' },
          { title: 'Checkout', value: 'checkout' },
          { title: 'Website', value: 'website' }
        ]
      }
    },
    {
      name: 'subscribedAt',
      title: 'Subscribed At',
      type: 'datetime'
    },
    {
      name: 'active',
      title: 'Active',
      type: 'boolean',
      initialValue: true
    }
  ],
  preview: {
    select: {
      title: 'email',
      subtitle: 'source'
    }
  }
}
