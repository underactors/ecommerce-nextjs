// blogPost.js
export default {
    name: 'blogPost',
    title: 'Blog Post',
    type: 'document',
    fields: [
      {
        name: 'title',
        title: 'Title',
        type: 'string',
        validation: Rule => Rule.required(),
      },
      {
        name: 'slug',
        title: 'Slug',
        type: 'slug',
        options: {
          source: 'title',
          maxLength: 200,
        },
        validation: Rule => Rule.required(),
      },
      {
        name: 'author',
        title: 'Author',
        type: 'string',
        validation: Rule => Rule.required(),
      },
      {
        name: 'publishedAt',
        title: 'Published At',
        type: 'datetime',
        validation: Rule => Rule.required(),
      },
      {
        name: 'excerpt',
        title: 'Excerpt',
        type: 'text',
      },
      {
        name: 'content',
        title: 'Content',
        type: 'array',
        of: [{ type: 'block' }],
      },
      {
        name: 'image',
        title: 'Image',
        type: 'image',
        options: {
          hotspot: true,
        },
      },
      {
        name: 'tags',
        title: 'Tags',
        type: 'array',
        of: [{ type: 'string' }],
      },
    ],
    initialValue: {
      publishedAt: new Date().toISOString(),
    },
  };
  