// app/product/[slug]/layout.js
import { client, urlFor } from '../../lib/sanity';

const TYPES = ['product', 'phone', 'product2', 'electronic', 'car', 'watch', 'phoneacc', 'offgrid', 'accessories'];

const getMetaImageUrl = (imageData) => {
  if (!imageData) return 'https://ruggtech.com/images/logo-icon.png';
  try {
    const img = Array.isArray(imageData) ? imageData[0] : imageData;
    if (!img) return 'https://ruggtech.com/images/logo-icon.png';
    const url = urlFor(img).width(1200).height(630).quality(90).auto('format').fit('crop').crop('center').url();
    return url || 'https://ruggtech.com/images/logo-icon.png';
  } catch {
    return 'https://ruggtech.com/images/logo-icon.png';
  }
};

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    let product = null;

    for (const type of TYPES) {
      product = await client.fetch(
        `*[_type == $type && slug.current == $slug][0]{
          name, description, details, price, brand, image, imageUrl
        }`,
        { type, slug }
      );
      if (product) break;
    }

    if (!product) {
      return { title: 'Product - RUGGTECH', description: 'Quality products at RUGGTECH' };
    }

    const imageUrl = getMetaImageUrl(product.image || product.imageUrl);
    const title = `${product.name} - ${product.brand || 'RUGGTECH'}`;
    const description = (product.description || product.details || `Buy ${product.name} at RUGGTECH. $${product.price}`).substring(0, 160);

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        url: `https://ruggtech.com/product/${slug}`,
        siteName: 'RUGGTECH',
        images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [imageUrl],
      },
      other: {
        'product:price:amount': String(product.price || ''),
        'product:price:currency': 'USD',
        'product:brand': product.brand || 'RUGGTECH',
        'product:availability': 'in stock',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return { title: 'Product - RUGGTECH', description: 'Quality products at RUGGTECH' };
  }
}

export default function ProductLayout({ children }) {
  return children;
}
