// checkout.js
export default {
  name: 'checkout',
  title: 'Checkout Information',
  type: 'document',
  fields: [
    {
      name: 'contact',
      title: 'Contact Information',
      type: 'object',
      fields: [
        { name: 'email', title: 'Email', type: 'string' },
        { name: 'phone', title: 'Phone', type: 'string' },
      ],
    },
    {
      name: 'shipping',
      title: 'Shipping Address',
      type: 'object',
      fields: [
        { name: 'name', title: 'Full Name', type: 'string' },
        { name: 'address', title: 'Address', type: 'string' },
        { name: 'city', title: 'City', type: 'string' },
        { name: 'country', title: 'Country', type: 'string' },
        { name: 'postalCode', title: 'Postal Code', type: 'string' },
        { name: 'saveInfo', title: 'Save Information', type: 'boolean' },
      ],
    },
    {
      name: 'orderDateTime',
      title: 'Order Date and Time',
      type: 'datetime',
    },
  ],
}
