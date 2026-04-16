// app/suzuki/[slug]/layout.js
import { client, urlFor } from '../../lib/sanity';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    // Fetch the product data specifically from 'car' content type
    const product = await client.fetch(`
      *[_type == 'car' && slug.current == $slug][0]{
        _id,
        name,
        price,
        image,
        brand,
        description,
        details,
        partNumber,
        compatibility,
        category,
        subsubcategory
      }
    `, { slug });

    if (!product) {
      return {
        title: 'Suzuki Part Not Found | RUGGTECH',
        description: 'The Suzuki part you are looking for was not found.',
        openGraph: {
          title: 'Suzuki Part Not Found | RUGGTECH',
          description: 'The Suzuki part you are looking for was not found.',
          url: `https://ruggtech.com/suzuki/${slug}`,
          type: 'website',
          siteName: 'RUGGTECH',
          images: [{ url: 'https://ruggtech.com/test.png', width: 800, height: 600 }],
        },
        twitter: {
          card: 'summary_large_image',
          title: 'Suzuki Part Not Found | RUGGTECH',
          description: 'The Suzuki part you are looking for was not found.',
          images: ['https://ruggtech.com/test.png'],
        },
      };
    }

    // Get image URL for metadata
    const getMetaImageUrl = (imageData) => {
      if (!imageData) return 'https://ruggtech.com/test.png';
      
      try {
        if (Array.isArray(imageData) && imageData.length > 0) {
          const imageUrl = urlFor(imageData[0])
            .width(1200)
            .height(630)
            .quality(90)
            .auto('format')
            .fit('crop')
            .crop('center')
            .url();
          return imageUrl.startsWith('http') ? imageUrl : `https://ruggtech.com${imageUrl}`;
        }
        
        if (imageData && imageData.asset) {
          const imageUrl = urlFor(imageData)
            .width(1200)
            .height(630)
            .quality(90)
            .auto('format')
            .fit('crop')
            .crop('center')
            .url();
          return imageUrl.startsWith('http') ? imageUrl : `https://ruggtech.com${imageUrl}`;
        }
      } catch (error) {
        console.warn('Error generating meta image URL:', error);
      }
      
      return 'https://ruggtech.com/test.png';
    };

    const imageUrl = getMetaImageUrl(product.image);
    const description = product.description || product.details || 
      `High-quality ${product.brand || 'Suzuki'} automotive part: ${product.name}. ${product.partNumber ? `Part #${product.partNumber}.` : ''} ${product.compatibility || 'Compatible with Suzuki vehicles.'}`;

    return {
      title: `${product.name} - ${product.brand || 'Suzuki'} | RUGGTECH`,
      description: description.substring(0, 160),
      keywords: `${product.name}, ${product.brand || 'Suzuki'}, ${product.partNumber || ''}, auto parts, OEM parts, ${product.category || product.subsubcategory || 'automotive'}`,
      openGraph: {
        title: `${product.name} - ${product.brand || 'Suzuki'} | RUGGTECH`,
        description: description.substring(0, 160),
        type: 'website', // Changed from 'product' to 'website' like your product layout
        url: `https://ruggtech.com/suzuki/${slug}`,
        siteName: 'RUGGTECH',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: `${product.name} - ${product.brand || 'Suzuki'}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} - ${product.brand || 'Suzuki'}`,
        description: description.substring(0, 160),
        creator: '@rugtech',
        images: [imageUrl],
      },
      other: {
        'product:price:amount': product.price || '0',
        'product:price:currency': 'USD',
        'product:brand': product.brand || 'Suzuki',
        'automotive:part_number': product.partNumber || '',
        'automotive:compatibility': product.compatibility || 'Suzuki vehicles',
        'automotive:category': product.category || product.subsubcategory || 'Auto Parts',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Suzuki Parts | RUGGTECH',
      description: 'High-quality Suzuki automotive parts and accessories.',
      openGraph: {
        title: 'Suzuki Parts | RUGGTECH',
        description: 'High-quality Suzuki automotive parts and accessories.',
        url: `https://ruggtech.com/suzuki/${slug}`,
        type: 'website',
        siteName: 'RUGGTECH',
        images: [{ url: 'https://ruggtech.com/test.png', width: 800, height: 600 }],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Suzuki Parts | RUGGTECH',
        description: 'High-quality Suzuki automotive parts and accessories.',
        images: ['https://ruggtech.com/test.png'],
      },
    };
  }
}

export default function SuzukiLayout({ children }) {
  return children;
}