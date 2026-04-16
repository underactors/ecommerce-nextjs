export default {
  name: 'sharedWishlist',
  title: 'Shared Wishlist',
  type: 'document',
  fields: [
    {
      name: 'shareId',
      title: 'Share ID',
      type: 'string',
      description: 'Unique identifier for sharing the wishlist',
    },
    {
      name: 'ownerName',
      title: 'Owner Name',
      type: 'string',
      description: 'Name of the wishlist owner',
    },
    {
      name: 'ownerId',
      title: 'Owner ID',
      type: 'string',
      description: 'Clerk user ID of the wishlist owner',
    },
    {
      name: 'items',
      title: 'Wishlist Items',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            { name: 'id', type: 'string', title: 'Product ID' },
            { name: 'name', type: 'string', title: 'Product Name' },
            { name: 'price', type: 'number', title: 'Price' },
            { name: 'brand', type: 'string', title: 'Brand' },
            { name: 'category', type: 'string', title: 'Category' },
            { name: 'type', type: 'string', title: 'Product Type' },
            { name: 'slug', type: 'string', title: 'Slug' },
            { name: 'imageUrl', type: 'string', title: 'Image URL' },
          ],
        },
      ],
    },
    {
      name: 'createdAt',
      title: 'Created At',
      type: 'datetime',
    },
    {
      name: 'updatedAt',
      title: 'Updated At',
      type: 'datetime',
    },
  ],
}
