// app/agritech/[slug]/layout.js
import { client, urlFor } from '../../lib/sanity';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  try {
    // Fetch the product data specifically from 'agritechPage' content type
    const product = await client.fetch(`
      *[_type == 'agritechPage' && slug.current == $slug][0]{
        _id,
        name,
        title,
        price,
        originalPrice,
        image,
        imageUrl,
        brand,
        description,
        category,
        subcategory,
        condition,
        farmSize,
        cropTypes,
        model,
        location,
        warranty,
        hoursUsed
      }
    `, { slug });

    if (!product) {
      return {
        title: 'AgriTech Equipment Not Found | RUGGTECH',
        description: 'The agricultural equipment you are looking for was not found.',
        openGraph: {
          title: 'AgriTech Equipment Not Found | RUGGTECH',
          description: 'The agricultural equipment you are looking for was not found.',
          url: `https://ruggtech.com/agritech/${slug}`,
          type: 'website',
          siteName: 'RUGGTECH',
          images: [{ url: 'https://ruggtech.com/test.png', width: 800, height: 600 }],
        },
        twitter: {
          card: 'summary_large_image',
          title: 'AgriTech Equipment Not Found | RUGGTECH',
          description: 'The agricultural equipment you are looking for was not found.',
          images: ['https://ruggtech.com/test.png'],
        },
      };
    }

    // Get image URL for metadata
    const getMetaImageUrl = (imageData) => {
      if (!imageData) return 'https://ruggtech.com/test.png';
      
      try {
        // Handle string URLs
        if (typeof imageData === 'string') {
          return imageData.startsWith('http') ? imageData : `https://ruggtech.com${imageData}`;
        }
        
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

    const imageUrl = getMetaImageUrl(product.image || product.imageUrl);
    const productName = product.name || product.title || 'Agricultural Equipment';
    const description = product.description || 
      `High-quality ${product.brand || 'agricultural'} equipment: ${productName}. ${product.condition ? `Condition: ${product.condition}.` : ''} ${product.farmSize ? `Suitable for ${product.farmSize} farms.` : ''} ${product.cropTypes ? `Compatible with: ${product.cropTypes.join(', ')}.` : ''}`;

    // Calculate savings info for description
    const hasDiscount = product.originalPrice && product.originalPrice > product.price;
    const savingsText = hasDiscount ? ` Save $${(product.originalPrice - product.price).toFixed(2)}!` : '';

    return {
      title: `${productName} - ${product.brand || 'AgriTech'} | RUGGTECH`,
      description: (description + savingsText).substring(0, 160),
      keywords: `${productName}, ${product.brand || 'agricultural equipment'}, ${product.category || ''}, ${product.condition || ''}, farming equipment, agricultural machinery, ${product.cropTypes ? product.cropTypes.join(', ') : 'agriculture'}`,
      openGraph: {
        title: `${productName} - ${product.brand || 'AgriTech'} | RUGGTECH`,
        description: (description + savingsText).substring(0, 160),
        type: 'website',
        url: `https://ruggtech.com/agritech/${slug}`,
        siteName: 'RUGGTECH',
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: `${productName} - ${product.brand || 'Agricultural Equipment'}`,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${productName} - ${product.brand || 'AgriTech'}`,
        description: (description + savingsText).substring(0, 160),
        creator: '@rugtech',
        images: [imageUrl],
      },
      other: {
        'product:price:amount': product.price || '0',
        'product:price:currency': 'USD',
        'product:brand': product.brand || 'Agricultural Equipment',
        'product:condition': product.condition || 'New',
        'agriculture:category': product.category || product.subcategory || 'Agricultural Equipment',
        'agriculture:farm_size': product.farmSize || 'Various',
        'agriculture:crop_types': product.cropTypes ? product.cropTypes.join(', ') : 'Multiple crops',
        'agriculture:location': product.location || 'Available nationwide',
        'product:availability': 'in stock',
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'AgriTech Equipment | RUGGTECH',
      description: 'High-quality agricultural equipment and machinery for modern farming.',
      openGraph: {
        title: 'AgriTech Equipment | RUGGTECH',
        description: 'High-quality agricultural equipment and machinery for modern farming.',
        url: `https://ruggtech.com/agritech/${slug}`,
        type: 'website',
        siteName: 'RUGGTECH',
        images: [{ url: 'https://ruggtech.com/test.png', width: 800, height: 600 }],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'AgriTech Equipment | RUGGTECH',
        description: 'High-quality agricultural equipment and machinery for modern farming.',
        images: ['https://ruggtech.com/test.png'],
      },
    };
  }
}

export default function AgriTechLayout({ children }) {
  return children;
}