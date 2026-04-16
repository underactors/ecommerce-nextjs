import { NextResponse } from 'next/server';
import { client } from '../../lib/sanity';

export async function GET() {
  try {
    let ruggedDeals = await client.fetch(`*[_type == 'product' && (featured == true || onSale == true)]{
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
      ram,
      rom,
      cameras,
      details,
      "contentType": "product"
    }`);
    
    if (!ruggedDeals || ruggedDeals.length === 0) {
      ruggedDeals = await client.fetch(`*[_type == 'product'][0...8]{
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
        ram,
        rom,
        cameras,
        details,
        "contentType": "product"
      }`);
    }

    let phoneDeals = await client.fetch(`*[_type == 'phone' && (featured == true || onSale == true)]{
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
      ram,
      rom,
      cameras,
      details,
      "contentType": "phone"
    }`);
    
    if (!phoneDeals || phoneDeals.length === 0) {
      phoneDeals = await client.fetch(`*[_type == 'phone'][0...4]{
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
        ram,
        rom,
        cameras,
        details,
        "contentType": "phone"
      }`);
    }

    let suzukiDeals = await client.fetch(`*[_type == 'car' && (featured == true || onSale == true)]{
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
      "contentType": "car"
    }`);
    
    if (!suzukiDeals || suzukiDeals.length === 0) {
      suzukiDeals = await client.fetch(`*[_type == 'car'][0...4]{
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
        "contentType": "car"
      }`);
    }

    let agriDeals = await client.fetch(`*[_type == 'agritechPage' && (featured == true || onSale == true)]{
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
      hoursUsed,
      "contentType": "agritechPage"
    }`);
    
    if (!agriDeals || agriDeals.length === 0) {
      agriDeals = await client.fetch(`*[_type == 'agritechPage'][0...4]{
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
        hoursUsed,
        "contentType": "agritechPage"
      }`);
    }

    const allDeals = [
      ...(ruggedDeals || []),
      ...(phoneDeals || []),
      ...(suzukiDeals || []),
      ...(agriDeals || [])
    ];

    const dealsWithDiscount = allDeals.map(deal => ({
      ...deal,
      discountPercent: deal.originalPrice && deal.originalPrice > deal.price 
        ? Math.round(((deal.originalPrice - deal.price) / deal.originalPrice) * 100)
        : 0
    }));

    return NextResponse.json({ 
      success: true, 
      deals: dealsWithDiscount,
      count: dealsWithDiscount.length
    });
  } catch (error) {
    console.error('Error fetching deals:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to fetch deals',
      deals: []
    }, { status: 500 });
  }
}
