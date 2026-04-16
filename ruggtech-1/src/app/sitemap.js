import { client } from './lib/sanity';

export default async function sitemap() {
  const baseUrl = 'https://ruggtech.com';
  
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/rugged-devices`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/phones-tablets`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/suzuki-parts`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/farming-equipment`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/accessories`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/deals`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/support`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/support/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/support/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/support/shipping`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/support/returns`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/support/order-status`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/company/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/legal/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  let productPages = [];

  try {
    const products = await client.fetch(`*[_type == "product"]{
      "slug": slug.current,
      _updatedAt
    }`);

    const phones = await client.fetch(`*[_type == "phone"]{
      "slug": slug.current,
      _updatedAt
    }`);

    const cars = await client.fetch(`*[_type == "car"]{
      "slug": slug.current,
      _updatedAt
    }`);

    const agritech = await client.fetch(`*[_type == "agritechPage"]{
      "slug": slug.current,
      _updatedAt
    }`);

    productPages = [
      ...products.map((p) => ({
        url: `${baseUrl}/product/${p.slug}`,
        lastModified: new Date(p._updatedAt),
        changeFrequency: 'weekly',
        priority: 0.7,
      })),
      ...phones.map((p) => ({
        url: `${baseUrl}/product/${p.slug}`,
        lastModified: new Date(p._updatedAt),
        changeFrequency: 'weekly',
        priority: 0.7,
      })),
      ...cars.map((p) => ({
        url: `${baseUrl}/suzuki/${p.slug}`,
        lastModified: new Date(p._updatedAt),
        changeFrequency: 'weekly',
        priority: 0.7,
      })),
      ...agritech.map((p) => ({
        url: `${baseUrl}/agritech/${p.slug}`,
        lastModified: new Date(p._updatedAt),
        changeFrequency: 'weekly',
        priority: 0.7,
      })),
    ];
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
  }

  return [...staticPages, ...productPages];
}
