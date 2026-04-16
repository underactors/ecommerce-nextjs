import { createClient } from '@sanity/client'
import imageUrlBuilder from '@sanity/image-url'

const isServer = typeof window === 'undefined';

export const client = createClient({
  projectId: 'pb8lzqs5',
  dataset: 'production',
  apiVersion: '2022-07-20',
  useCdn: true,
  token: isServer ? process.env.SANITY_API_TOKEN : undefined,
  ignoreBrowserTokenWarning: true,
})

export const writeClient = createClient({
  projectId: 'pb8lzqs5',
  dataset: 'production',
  apiVersion: '2022-07-20',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

// ADDED: Debug function to check token
export function debugSanityConfig() {
  console.log('🔍 Sanity Debug Info:');
  console.log('Project ID:', 'pb8lzqs5');
  console.log('Dataset:', 'production');
  console.log('Token exists:', !!process.env.SANITY_API_TOKEN);
  console.log('Token length:', process.env.SANITY_API_TOKEN?.length || 0);
  console.log('Token starts with:', process.env.SANITY_API_TOKEN?.substring(0, 10));
}

export async function fetchDataFromSanity(query) {
  const result = await client.fetch(`*[name match "${query}*"]{...}`)
  return result
}

export async function fetchCategoriesFromSanity() {
  try {
    const result = await client.fetch(
      `*[_type == 'product']{categories} | order(categories asc)`
    )
    const categories = Array.from(
      new Set(result.flatMap(product => product.categories))
    )
    return categories
  } catch (error) {
    console.error('Error fetching categories:', error.message)
    throw new Error('Internal Server Error')
  }
}

export async function fetchSubcategoriesFromSanity() {
  try {
    const result = await client.fetch(
      `*[_type in ['product', 'product2', 'watch', 'phone', 'phoneacc', 'car', 'agritechPage']]{subcategories} | order(subcategories asc)`
    );
    const subcategories = Array.from(
      new Set(result.flatMap(product => product.subcategories || []))
    );
    return subcategories;
  } catch (error) {
    console.error('Error fetching subcategories:', error.message);
    throw new Error('Internal Server Error');
  }
}

const builder = imageUrlBuilder(client)

export const urlFor = source => builder.image(source)

export async function searchProducts(query) {
  try {
    const result = await client.fetch(
      `*[_type == 'product' && (brand match $query || id match $query || keywords match $query || keywoards match $query || location match $query || subsubcategory match $query || name match $query)]`,
      { query }
    )
    return result
  } catch (error) {
    console.error('Error fetching products:', error.message)
    throw new Error('Internal Server Error')
  }
}

export async function searchProducts2(query) {
  try {
    const result2 = await client.fetch(
      `*[_type == 'product2' && (brand match $query || id match $query || keywords match $query || keywoards match $query || location match $query || subsubcategory match $query || name match $query)]`,
      { query }
    )
    return result2
  } catch (error) {
    console.error('Error fetching products:', error.message)
    throw new Error('Internal Server Error')
  }
}

export async function searchProducts3(query) {
  try {
    const watch = await client.fetch(
      `*[_type == 'watch' && (brand match $query || id match $query || keywords match $query || keywoards match $query || location match $query || subsubcategory match $query || name match $query)]`,
      { query }
    )
    return watch
  } catch (error) {
    console.error('Error fetching products:', error.message)
    throw new Error('Internal Server Error')
  }
}

export async function searchProducts4(query) {
  try {
    const phone = await client.fetch(
      `*[_type == 'phone' && (brand match $query || id match $query || keywords match $query || keywoards match $query || location match $query || subsubcategory match $query || name match $query)]`,
      { query }
    )
    return phone
  } catch (error) {
    console.error('Error fetching products:', error.message)
    throw new Error('Internal Server Error')
  }
}

export async function searchProducts5(query) {
  try {
    const phoneacc = await client.fetch(
      `*[_type == 'phoneacc' && (brand match $query || id match $query || keywords match $query || keywoards match $query || location match $query || subsubcategory match $query || name match $query)]`,
      { query }
    )
    return phoneacc
  } catch (error) {
    console.error('Error fetching products:', error.message)
    throw new Error('Internal Server Error')
  }
}

export async function searchCars(query) {
  try {
    const result = await client.fetch(
      `*[_type == 'car' && (brand match $query || id match $query || keywords match $query || keywoards match $query || location match $query || subsubcategory match $query || name match $query)]`,
      { query }
    );

    console.log('Car search results:', result);

    return result;
  } catch (error) {
    console.error('Error fetching cars:', error.message);
    throw new Error('Internal Server Error');
  }
}

// FIXED: AgriTech search function with comprehensive field matching and typo fixes
export async function searchAgriTech(query) {
  try {
    const result = await client.fetch(
      `*[_type == 'agritechPage' && (
        brand match $query || 
        id match $query || 
        keywords match $query ||
        keywoards match $query || 
        location match $query || 
        subsubcategory match $query || 
        name match $query || 
        category match $query || 
        subcategory match $query || 
        cropTypes[] match $query || 
        farmSize match $query ||
        condition match $query ||
        technology.type match $query ||
        description match $query ||
        model match $query ||
        manufacturer match $query ||
        title match $query
      )] | order(_createdAt desc)`,
      { query }
    );

    console.log('AgriTech search results:', result);

    return result;
  } catch (error) {
    console.error('Error fetching AgriTech equipment:', error.message);
    throw new Error('Internal Server Error');
  }
}

// Get all AgriTech products (for testing)
export async function fetchAllAgriTech(limit = 50) {
  try {
    const result = await client.fetch(
      `*[_type == 'agritechPage'] | order(_createdAt desc)[0...${limit}]{
        _id,
        name,
        title,
        price,
        originalPrice,
        image,
        "imageUrl": image.asset->url,
        brand,
        manufacturer,
        model,
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
        keywords,
        keywoards,
        _createdAt,
        _updatedAt
      }`
    );

    console.log('All AgriTech products fetched:', result.length);
    if (result.length > 0) {
      console.log('Sample AgriTech product:', result[0]);
    }

    return result;
  } catch (error) {
    console.error('Error fetching all AgriTech products:', error.message);
    throw new Error('Internal Server Error');
  }
}

// Get featured AgriTech products
export async function fetchFeaturedAgriTech(limit = 8) {
  try {
    const result = await client.fetch(
      `*[_type == 'agritechPage' && featured == true] | order(_createdAt desc)[0...${limit}]{
        _id,
        name,
        title,
        price,
        originalPrice,
        image,
        "imageUrl": image.asset->url,
        brand,
        manufacturer,
        model,
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
        keywords,
        keywoards
      }`
    );

    console.log('Featured AgriTech products:', result);

    return result;
  } catch (error) {
    console.error('Error fetching featured AgriTech products:', error.message);
    throw new Error('Internal Server Error');
  }
}

// NEW: Get single AgriTech product by slug or ID - THIS WAS MISSING!
export async function fetchAgriTechProduct(identifier) {
  try {
    const result = await client.fetch(
      `*[_type == 'agritechPage' && (slug.current == $identifier || _id == $identifier)][0]{
        _id,
        name,
        title,
        price,
        originalPrice,
        image,
        "imageUrl": image.asset->url,
        brand,
        manufacturer,
        model,
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
        keywords,
        keywoards,
        _createdAt,
        _updatedAt
      }`,
      { identifier }
    );

    console.log('Single AgriTech product fetched:', result ? result.name : 'Not found');
    return result;
  } catch (error) {
    console.error('Error fetching single AgriTech product:', error.message);
    throw new Error('Internal Server Error');
  }
}

// TEST: Simple AgriTech search for debugging
export async function testAgriTechSearch(query) {
  try {
    console.log('Testing AgriTech search for:', query);
    
    // First, let's see what AgriTech products exist
    const allAgriTech = await client.fetch(`*[_type == 'agritechPage']{_id, name, title, brand, category}`);
    console.log('All available AgriTech products:', allAgriTech);
    
    // Then try the search
    const searchResult = await client.fetch(
      `*[_type == 'agritechPage' && name match $query]`,
      { query }
    );
    console.log('Search result for name match:', searchResult);
    
    // Try broader search
    const broadSearch = await client.fetch(
      `*[_type == 'agritechPage' && (name match $query || brand match $query || category match $query)]`,
      { query }
    );
    console.log('Broad search result:', broadSearch);
    
    return broadSearch;
  } catch (error) {
    console.error('Error in test search:', error);
    throw error;
  }
}

// ENHANCED: Combined search function that searches all content types including AgriTech
export async function searchAllProducts(query) {
  try {
    console.log('Starting combined search for:', query);
    
    const [products, products2, watches, phones, phoneacc, cars, agritech] = await Promise.all([
      searchProducts(query),
      searchProducts2(query),
      searchProducts3(query),
      searchProducts4(query),
      searchProducts5(query),
      searchCars(query),
      searchAgriTech(query)
    ]);

    console.log('Individual search results:');
    console.log('Products:', products.length);
    console.log('Products2:', products2.length);
    console.log('Watches:', watches.length);
    console.log('Phones:', phones.length);
    console.log('Phone accessories:', phoneacc.length);
    console.log('Cars:', cars.length);
    console.log('AgriTech:', agritech.length);

    // Combine all results and add a type identifier for each
    const allResults = [
      ...products.map(item => ({ ...item, contentType: 'product' })),
      ...products2.map(item => ({ ...item, contentType: 'product2' })),
      ...watches.map(item => ({ ...item, contentType: 'watch' })),
      ...phones.map(item => ({ ...item, contentType: 'phone' })),
      ...phoneacc.map(item => ({ ...item, contentType: 'phoneacc' })),
      ...cars.map(item => ({ ...item, contentType: 'car' })),
      ...agritech.map(item => ({ ...item, contentType: 'agritechPage' }))
    ];

    console.log('Combined search results total:', allResults.length);
    console.log('AgriTech results in combined search:', agritech.length);
    
    if (agritech.length > 0) {
      console.log('Sample AgriTech result:', agritech[0]);
    }

    return allResults;
  } catch (error) {
    console.error('Error in combined search:', error.message);
    throw new Error('Internal Server Error');
  }
}

// ==========================================
// ADDED: CART FUNCTIONALITY BELOW
// ==========================================

// Test connection function for cart API
export async function testConnection() {
  try {
    // Debug the configuration first
    debugSanityConfig();
    
    const result = await client.fetch('*[_type == "userCart"][0..2]');
    console.log('✅ Sanity connection test successful');
    return true;
  } catch (error) {
    console.error('❌ Sanity connection test failed:', error);
    return false;
  }
}

// Helper function to create user cart document
export async function createUserCart(userId, cartItems = []) {
  try {
    console.log('🏗️ Creating cart for user:', userId, 'with', cartItems.length, 'items');
    
    const cartData = {
      _type: 'userCart',
      userId,
      cartItems: cartItems.map(item => {
        // Only use imageUrl if it's a valid string URL
        const imageUrlValue = typeof item.imageUrl === 'string' && item.imageUrl.startsWith('http') 
          ? item.imageUrl 
          : '';
        
        return {
          productId: item.id || item._id || 'unknown',
          internalId: item._id || item.id || 'unknown',
          name: item.name || item.title || 'Unknown Product',
          price: parseFloat(item.price) || 0,
          quantity: parseInt(item.quantity) || 1,
          imageUrl: imageUrlValue,
          brand: item.brand || '',
          category: item.category || '',
          type: item.type || 'product',
          addedBy: item.addedBy || userId,
          addedAt: item.addedAt || new Date().toISOString(),
          slug: item.slug || null,
          contentType: item.contentType || null,
          partNumber: item.partNumber || null,
          compatibility: item.compatibility || null,
          inStock: item.inStock !== undefined ? item.inStock : null,
        };
      }),
      itemCount: cartItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0),
      totalValue: cartItems.reduce((sum, item) => sum + ((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1)), 0),
      lastUpdated: new Date().toISOString(),
    };

    const result = await writeClient.create(cartData);
    console.log('✅ Created new cart document:', result._id);
    return result;
  } catch (error) {
    console.error('❌ Error creating user cart:', error);
    throw error;
  }
}

// Helper function to update user cart
export async function updateUserCart(cartId, cartItems) {
  try {
    console.log('🔄 Updating cart:', cartId, 'with', cartItems.length, 'items');
    
    const cartData = {
      cartItems: cartItems.map(item => {
        // Only use imageUrl if it's a valid string URL
        const imageUrlValue = typeof item.imageUrl === 'string' && item.imageUrl.startsWith('http') 
          ? item.imageUrl 
          : '';
        
        return {
          productId: item.id || item._id || item.productId || 'unknown',
          internalId: item._id || item.id || item.internalId || 'unknown',
          name: item.name || item.title || 'Unknown Product',
          price: parseFloat(item.price) || 0,
          quantity: parseInt(item.quantity) || 1,
          imageUrl: imageUrlValue,
          brand: item.brand || '',
          category: item.category || '',
          type: item.type || 'product',
          addedBy: item.addedBy || null,
          addedAt: item.addedAt || new Date().toISOString(),
          slug: item.slug || null,
          contentType: item.contentType || null,
          partNumber: item.partNumber || null,
          compatibility: item.compatibility || null,
          inStock: item.inStock !== undefined ? item.inStock : null,
        };
      }),
      itemCount: cartItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0),
      totalValue: cartItems.reduce((sum, item) => sum + ((parseFloat(item.price) || 0) * (parseInt(item.quantity) || 1)), 0),
      lastUpdated: new Date().toISOString(),
    };

    const result = await writeClient.patch(cartId).set(cartData).commit();
    console.log('✅ Updated cart document:', cartId);
    return result;
  } catch (error) {
    console.error('❌ Error updating user cart:', error);
    throw error;
  }
}

// Get user cart by userId
export async function getUserCart(userId) {
  try {
    console.log('🔍 Fetching cart for user:', userId);
    
    const result = await client.fetch(
      `*[_type == 'userCart' && userId == $userId][0]`,
      { userId }
    );
    
    if (result) {
      console.log('✅ Found existing cart for user:', userId, '- Items:', result.cartItems?.length || 0);
    } else {
      console.log('📭 No cart found for user:', userId);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error fetching user cart:', error);
    throw error;
  }
}

// Delete user cart
export async function deleteUserCart(cartId) {
  try {
    console.log('🗑️ Deleting cart:', cartId);
    await writeClient.delete(cartId);
    console.log('✅ Deleted cart document:', cartId);
    return true;
  } catch (error) {
    console.error('❌ Error deleting user cart:', error);
    throw error;
  }
}

export default client;