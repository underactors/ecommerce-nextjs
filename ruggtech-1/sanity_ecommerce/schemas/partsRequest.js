const STATUS_ICONS = {
  new: '🆕',
  sourcing: '🔍',
  found: '✅',
  notified: '📧',
  closed: '🔒',
};

export default {
  name: 'partsRequest',
  title: 'Customer Inquiries',
  type: 'document',
  fields: [
    // ── What they want ─────────────────────────────────────────────────
    {
      name: 'inquiryType',
      title: 'Inquiry Type',
      type: 'string',
      options: {
        list: [
          { title: 'Part / Product Not Found', value: 'part_not_found' },
          { title: 'Price / Bulk Quote',        value: 'price_quote' },
          { title: 'Custom Order',              value: 'custom_order' },
          { title: 'Support Ticket',            value: 'support_ticket' },
        ],
        layout: 'radio',
      },
    },
    {
      name: 'partName',
      title: 'Product / Part Name',
      type: 'string',
    },
    {
      name: 'vehicleMake',
      title: 'Vehicle Make',
      type: 'string',
    },
    {
      name: 'vehicleModel',
      title: 'Vehicle Model',
      type: 'string',
    },
    {
      name: 'vehicleYear',
      title: 'Vehicle Year',
      type: 'string',
    },
    {
      name: 'partNumber',
      title: 'Part Number / SKU',
      type: 'string',
    },
    {
      name: 'quantity',
      title: 'Quantity',
      type: 'number',
      initialValue: 1,
    },
    {
      name: 'urgency',
      title: 'Urgency',
      type: 'string',
      options: {
        list: [
          { title: 'Low',    value: 'low' },
          { title: 'Normal', value: 'normal' },
          { title: 'Urgent', value: 'urgent' },
        ],
        layout: 'radio',
      },
      initialValue: 'normal',
    },
    {
      name: 'notes',
      title: 'Additional Notes',
      type: 'text',
      rows: 4,
    },

    // ── Contact ─────────────────────────────────────────────────────────
    {
      name: 'customerName',
      title: 'Customer Name',
      type: 'string',
    },
    {
      name: 'customerEmail',
      title: 'Customer Email',
      type: 'string',
    },
    {
      name: 'customerWhatsapp',
      title: 'Customer WhatsApp',
      type: 'string',
      description: 'Include country code, e.g. 18683001234',
    },
    {
      name: 'customerId',
      title: 'Clerk User ID',
      type: 'string',
      readOnly: true,
    },
    {
      name: 'preferredContact',
      title: 'Preferred Contact Channel',
      type: 'string',
      options: {
        list: [
          { title: 'Email',    value: 'email' },
          { title: 'WhatsApp', value: 'whatsapp' },
        ],
        layout: 'radio',
      },
    },

    // ── Admin ────────────────────────────────────────────────────────────
    {
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: '🆕 New',       value: 'new' },
          { title: '🔍 Sourcing',  value: 'sourcing' },
          { title: '✅ Found',     value: 'found' },
          { title: '📧 Notified',  value: 'notified' },
          { title: '🔒 Closed',    value: 'closed' },
        ],
        layout: 'radio',
      },
      initialValue: 'new',
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
      readOnly: true,
    },
    {
      name: 'source',
      title: 'Source',
      type: 'string',
      initialValue: 'chat',
      readOnly: true,
    },
    {
      name: 'adminNotes',
      title: 'Admin Notes',
      type: 'text',
      rows: 3,
    },
  ],

  preview: {
    select: {
      status: 'status',
      partName: 'partName',
      inquiryType: 'inquiryType',
      customerEmail: 'customerEmail',
      customerName: 'customerName',
    },
    prepare({ status, partName, inquiryType, customerEmail, customerName }) {
      const icon = STATUS_ICONS[status] || '📋';
      const subject = partName || inquiryType || 'General Inquiry';
      const contact = customerEmail || customerName || 'Unknown';
      return {
        title: `${icon} ${subject}`,
        subtitle: contact,
      };
    },
  },

  orderings: [
    {
      title: 'Newest First',
      name: 'createdAtDesc',
      by: [{ field: 'createdAt', direction: 'desc' }],
    },
    {
      title: 'Status',
      name: 'statusAsc',
      by: [{ field: 'status', direction: 'asc' }],
    },
  ],
};
