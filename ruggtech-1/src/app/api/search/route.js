// app/api/search/route.js
import { 
  searchProducts, 
  searchProducts2, 
  searchProducts3, 
  searchProducts4, 
  searchProducts5, 
  searchCars,
  searchAgriTech  // Add this import
} from '../../../app/lib/sanity';
import { urlFor } from '../../../app/lib/sanity'; // Import the image URL builder
import { trackSearchQuery } from '../../lib/notion'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    if (!query || query.trim().length < 2) {
      return Response.json({
        success: true,
        products: [],
        message: 'Query too short'
      });
    }

    console.log('🔍 Searching for:', query);

    // Search across all your product types INCLUDING AgriTech
    const [
      products1,
      products2, 
      watches,
      phones,
      phoneAccessories,
      cars,
      agritech  // Add AgriTech search
    ] = await Promise.all([
      searchProducts(query).catch(err => {
        console.error('Error searching products:', err);
        return [];
      }),
      searchProducts2(query).catch(err => {
        console.error('Error searching products2:', err);
        return [];
      }),
      searchProducts3(query).catch(err => {
        console.error('Error searching watches:', err);
        return [];
      }),
      searchProducts4(query).catch(err => {
        console.error('Error searching phones:', err);
        return [];
      }),
      searchProducts5(query).catch(err => {
        console.error('Error searching phone accessories:', err);
        return [];
      }),
      searchCars(query).catch(err => {
        console.error('Error searching cars:', err);
        return [];
      }),
      searchAgriTech(query).catch(err => {  // Add AgriTech search with error handling
        console.error('Error searching AgriTech:', err);
        return [];
      })
    ]);

    console.log('Search results breakdown:');
    console.log('- Products1:', products1.length);
    console.log('- Products2:', products2.length);
    console.log('- Watches:', watches.length);
    console.log('- Phones:', phones.length);
    console.log('- Phone Accessories:', phoneAccessories.length);
    console.log('- Cars:', cars.length);
    console.log('- AgriTech:', agritech.length);  // Log AgriTech results

    // Helper function to process image URLs
    const processImageUrl = (imageField) => {
      if (!imageField) return null;
      
      try {
        // Handle different image field structures
        if (typeof imageField === 'string') {
          return imageField; // Direct URL
        }
        
        if (imageField._type === 'image' && imageField.asset) {
          // Sanity image asset
          return urlFor(imageField).width(300).height(300).url();
        }
        
        if (imageField.asset && imageField.asset._ref) {
          // Sanity image with asset reference
          return urlFor(imageField).width(300).height(300).url();
        }
        
        if (Array.isArray(imageField) && imageField.length > 0) {
          // Array of images, take the first one
          return processImageUrl(imageField[0]);
        }
        
        return null;
      } catch (error) {
        console.error('Error processing image:', error);
        return null;
      }
    };

    // Helper function to get the correct URL for a product
    const getProductUrl = (product, productType) => {
      // AgriTech specific URL handling
      if (productType === 'agritechPage') {
        if (product.slug?.current) {
          return `/agritech/${product.slug.current}`;
        }
        return `/agritech/${product._id}`;
      }
      
      // Car specific URL handling
      if (productType === 'car') {
        if (product.slug?.current) {
          return `/suzuki/${product.slug.current}`;
        }
        return `/suzuki/${product._id}`;
      }
      
      if (product.slug?.current) {
        return `/product/${product.slug.current}`;
      }
      if (product.slug && typeof product.slug === 'string') {
        return `/product/${product.slug}`;
      }
      return `/product/${product._id}`;
    };

    // Process AgriTech products with proper contentType
    const processedAgriTech = agritech.map(p => ({
      ...p,
      contentType: 'agritechPage',  // Use contentType instead of productType for consistency
      productType: 'agritechPage',  // Keep both for backward compatibility
      category: p.category || 'Agricultural Equipment',
      imageUrl: p.imageUrl || processImageUrl(p.image || p.images || p.productImage),
      productUrl: getProductUrl(p, 'agritechPage'),
      // Ensure name field exists (use title as fallback)
      name: p.name || p.title,
      // Add AgriTech specific fields for display
      condition: p.condition,
      farmSize: p.farmSize,
      cropTypes: p.cropTypes,
      manufacturer: p.manufacturer,
      model: p.model,
      hoursUsed: p.hoursUsed,
      featured: p.featured,
      onSale: p.onSale,
      inStock: p.inStock
    }));

    // Combine all results and add type information with processed images and URLs
    const allProducts = [
      ...products1.map(p => ({ 
        ...p, 
        contentType: 'product',
        productType: 'product', 
        category: p.categories?.[0] || 'Product',
        imageUrl: processImageUrl(p.image || p.images || p.productImage),
        productUrl: getProductUrl(p, 'product'),
        name: p.name || p.title
      })),
      ...products2.map(p => ({ 
        ...p, 
        contentType: 'product2',
        productType: 'product2', 
        category: p.categories?.[0] || 'Product',
        imageUrl: processImageUrl(p.image || p.images || p.productImage),
        productUrl: getProductUrl(p, 'product2'),
        name: p.name || p.title
      })),
      ...watches.map(p => ({ 
        ...p, 
        contentType: 'watch',
        productType: 'watch', 
        category: 'Watches',
        imageUrl: processImageUrl(p.image || p.images || p.productImage),
        productUrl: getProductUrl(p, 'watch'),
        name: p.name || p.title
      })),
      ...phones.map(p => ({ 
        ...p, 
        contentType: 'phone',
        productType: 'phone', 
        category: 'Phones',
        imageUrl: processImageUrl(p.image || p.images || p.productImage),
        productUrl: getProductUrl(p, 'phone'),
        name: p.name || p.title
      })),
      ...phoneAccessories.map(p => ({ 
        ...p, 
        contentType: 'phoneacc',
        productType: 'phoneacc', 
        category: 'Phone Accessories',
        imageUrl: processImageUrl(p.image || p.images || p.productImage),
        productUrl: getProductUrl(p, 'phoneacc'),
        name: p.name || p.title
      })),
      ...cars.map(p => ({ 
        ...p, 
        contentType: 'car',
        productType: 'car', 
        category: 'Suzuki Parts',
        imageUrl: processImageUrl(p.image || p.images || p.productImage),
        productUrl: getProductUrl(p, 'car'),
        name: p.name || p.title
      })),
      ...processedAgriTech  // Add processed AgriTech products
    ];

    // Sort by relevance (featured first, then exact matches, then partial matches)
    const sortedProducts = allProducts.sort((a, b) => {
      // Prioritize featured products
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      
      // Then by exact name matches
      const aExact = a.name?.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
      const bExact = b.name?.toLowerCase().includes(query.toLowerCase()) ? 1 : 0;
      if (aExact !== bExact) return bExact - aExact;
      
      // Then by category relevance (if searching for category-specific terms)
      const categoryTerms = {
        'tractor': 'agritechPage',
        'farm': 'agritechPage',
        'agricultural': 'agritechPage',
        'equipment': 'agritechPage',
        'suzuki': 'car',
        'phone': 'phone',
        'watch': 'watch'
      };
      
      const queryLower = query.toLowerCase();
      for (const [term, type] of Object.entries(categoryTerms)) {
        if (queryLower.includes(term)) {
          if (a.contentType === type && b.contentType !== type) return -1;
          if (a.contentType !== type && b.contentType === type) return 1;
        }
      }
      
      return 0;
    });

    // Limit results for performance but increase limit for better results
    const limitedProducts = sortedProducts.slice(0, Math.min(limit, 100));

    console.log(`✅ Found ${limitedProducts.length} products for "${query}"`);
    console.log('Content type breakdown:', {
      agritech: limitedProducts.filter(p => p.contentType === 'agritechPage').length,
      cars: limitedProducts.filter(p => p.contentType === 'car').length,
      phones: limitedProducts.filter(p => p.contentType === 'phone').length,
      watches: limitedProducts.filter(p => p.contentType === 'watch').length,
      accessories: limitedProducts.filter(p => p.contentType === 'phoneacc').length,
      products: limitedProducts.filter(p => p.contentType === 'product').length,
      products2: limitedProducts.filter(p => p.contentType === 'product2').length
    });

    // Only track to Notion when user explicitly submits search (not autocomplete)
    const shouldTrack = searchParams.get('track') === 'true'
    
    if (shouldTrack) {
      const userId = searchParams.get('userId') || ''
      const userEmail = searchParams.get('userEmail') || ''
      const userName = searchParams.get('userName') || ''
      
      trackSearchQuery({
        query,
        userId,
        userEmail,
        userName,
        resultsCount: allProducts.length
      }).catch(err => console.error('Notion search tracking failed:', err))
    }

    return Response.json({
      success: true,
      products: limitedProducts,
      query: query,
      totalResults: allProducts.length,
      breakdown: {
        agritech: agritech.length,
        cars: cars.length,
        phones: phones.length,
        watches: watches.length,
        accessories: phoneAccessories.length,
        products1: products1.length,
        products2: products2.length
      }
    });

  } catch (error) {
    console.error('❌ Search API error:', error);
    return Response.json({
      success: false,
      error: 'Search failed',
      details: error.message
    }, { status: 500 });
  }
}