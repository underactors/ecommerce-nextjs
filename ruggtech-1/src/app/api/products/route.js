import { NextResponse } from 'next/server';
import { client } from '../../lib/sanity';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  try {
    let query = '';
    let products = [];

    switch (category) {
      case 'rugged-devices':
        query = `*[_type == 'product']{
          _id,
          _type,
          name,
          price,
          originalPrice,
          image,
          "imageUrl": image[0].asset->url,
          brand,
          slug,
          description,
          specifications,
          category,
          inStock,
          featured,
          onSale,
          protectionRating,
          screenSize,
          features,
          ram,
          rom,
          cameras,
          details
        }`;
        break;

      case 'phones-tablets':
        query = `*[_type == 'phone']{
          _id,
          _type,
          name,
          price,
          originalPrice,
          image,
          "imageUrl": image[0].asset->url,
          brand,
          slug,
          description,
          specifications,
          category,
          inStock,
          featured,
          onSale,
          deviceType,
          phoneScreenSize,
          tabletScreenSize,
          storage,
          ram,
          rom,
          cameras,
          details
        }`;
        break;

      case 'suzuki-parts':
        query = `*[_type == 'car']{
          _id,
          name,
          price,
          originalPrice,
          image,
          "imageUrl": image[0].asset->url,
          brand,
          slug,
          description,
          specifications,
          category,
          inStock,
          featured,
          onSale,
          partNumber,
          compatibility,
          warranty,
          oem,
          vehicleModel,
          year,
          partCategory,
          condition
        }`;
        break;

      case 'agritech':
        query = `*[_type == 'agritechPage']{
          _id,
          name,
          price,
          originalPrice,
          image,
          "imageUrl": image[0].asset->url,
          brand,
          slug,
          description,
          category,
          subcategory,
          condition,
          inStock,
          featured,
          onSale,
          cropTypes,
          farmSize,
          technology,
          warranty,
          financing,
          deliveryIncluded,
          installationService,
          trainingIncluded,
          location,
          hoursUsed
        }`;
        break;

      case 'accessories':
        query = `*[_type == 'phoneacc' || _type == 'electronic' || _type == 'watch']{
          _id,
          _type,
          name,
          price,
          originalPrice,
          image,
          "imageUrl": image[0].asset->url,
          brand,
          slug,
          description,
          category,
          inStock,
          featured,
          onSale
        }`;
        break;

      case 'off-grid':
        query = `*[_type == 'offgrid']{
          _id,
          name,
          price,
          originalPrice,
          image,
          "imageUrl": image[0].asset->url,
          brand,
          slug,
          description,
          equipmentType,
          powerOutput,
          powerSource,
          inStock,
          featured,
          onSale,
          specifications,
          warranty
        }`;
        break;

      default:
        query = `*[_type in ['product', 'phone', 'car', 'agritechPage', 'phoneacc', 'electronic', 'watch', 'offgrid']][0...20]{
          _id,
          _type,
          name,
          price,
          originalPrice,
          image,
          "imageUrl": image[0].asset->url,
          brand,
          slug,
          inStock,
          featured,
          onSale
        }`;
    }

    products = await client.fetch(query);

    return NextResponse.json({
      success: true,
      products: products || [],
      category: category
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch products',
      products: []
    }, { status: 500 });
  }
}
