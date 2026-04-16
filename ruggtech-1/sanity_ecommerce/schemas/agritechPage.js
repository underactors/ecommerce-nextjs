// schemas/agritechPage.js - AgriTech Page Schema for Dynamic Product Pages

export default {
  name: 'agritechPage',
  title: 'AgriTech Product Page',
  type: 'document',
  icon: () => '🚜',
  groups: [
    { name: 'shipping', title: 'Shipping Information' },
  ],
  fields: [
    // Basic Page Information
    {
      name: 'name',
      title: 'Product Name',
      type: 'string',
      validation: Rule => Rule.required().min(5).max(100),
      description: 'The main product name (e.g., "John Deere X350 Lawn Tractor")'
    },
    {
      name: 'imageAlt',
      title: 'Image SEO Description',
      type: 'string',
      description: 'Alt text for images (auto-generated from product name if left empty). Used for SEO and accessibility.',
    },
    {
      name: 'slug',
      title: 'URL Slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
      },
      validation: Rule => Rule.required(),
      description: 'URL-friendly version of the product name'
    },
    {
      name: 'description',
      title: 'Short Description',
      type: 'text',
      rows: 4,
      validation: Rule => Rule.max(500),
      description: 'Brief product description for cards and previews'
    },
    {
      name: 'longDescription',
      title: 'Detailed Description',
      type: 'array',
      of: [
        {
          type: 'block',
          styles: [
            {title: 'Normal', value: 'normal'},
            {title: 'H3', value: 'h3'},
            {title: 'H4', value: 'h4'},
            {title: 'Quote', value: 'blockquote'}
          ],
          lists: [
            {title: 'Bullet', value: 'bullet'},
            {title: 'Number', value: 'number'}
          ],
          marks: {
            decorators: [
              {title: 'Strong', value: 'strong'},
              {title: 'Emphasis', value: 'em'},
              {title: 'Code', value: 'code'}
            ]
          }
        }
      ],
      description: 'Detailed product description with rich text formatting'
    },

    // Product Images (Multiple Images Support)
    {
      name: 'image',
      title: 'Main Product Image',
      type: 'array',
      of: [{ type: 'image' }],
      options: {
        hotspot: true
      },
      validation: Rule => Rule.required(),
      description: 'Primary product image shown in gallery'
    },
    {
      name: 'image2',
      title: 'Product Image 2',
      type: 'array',
      of: [{ type: 'image' }],
      options: {
        hotspot: true
      },
      description: 'Additional product angle or feature'
    },
    {
      name: 'image3',
      title: 'Product Image 3', 
      type: 'array',
      of: [{ type: 'image' }],
      options: {
        hotspot: true
      },
      description: 'Third product image'
    },
    {
      name: 'image4',
      title: 'Product Image 4',
      type: 'array',
      of: [{ type: 'image' }],
      options: {
        hotspot: true
      },
      description: 'Fourth product image'
    },
    {
      name: 'image5',
      title: 'Product Image 5',
      type: 'array',
      of: [{ type: 'image' }],
      options: {
        hotspot: true
      },
      description: 'Fifth product image'
    },
    {
      name: 'image6',
      title: 'Product Image 6',
      type: 'array',
      of: [{ type: 'image' }],
      options: {
        hotspot: true
      },
      description: 'Sixth product image'
    },
    {
      name: 'videoUrl',
      title: 'Product Demo Video URL',
      type: 'url',
      description: 'YouTube, Vimeo, or direct video URL'
    },

    // Pricing & Availability
    {
      name: 'price',
      title: 'Current Price (USD)',
      type: 'number',
      validation: Rule => Rule.required().positive()
    },
    {
      name: 'originalPrice',
      title: 'Original Price (for sales)',
      type: 'number',
      validation: Rule => Rule.positive(),
      description: 'Original price if item is on sale'
    },
    {
      name: 'currency',
      title: 'Currency',
      type: 'string',
      options: {
        list: [
          { title: 'USD ($)', value: 'USD' },
          { title: 'TTD (TT$)', value: 'TTD' },
          { title: 'EUR (€)', value: 'EUR' }
        ]
      },
      initialValue: 'USD'
    },
    {
      name: 'inStock',
      title: 'In Stock',
      type: 'boolean',
      initialValue: true
    },
    {
      name: 'stockQuantity',
      title: 'Stock Quantity',
      type: 'number',
      validation: Rule => Rule.min(0),
      description: 'Number of units available'
    },
    {
      name: 'stock',
      title: 'Stock',
      type: 'number',
      validation: Rule => Rule.min(0),
      description: 'Stock count'
    },

    // Brand & Manufacturer Information
    {
      name: 'brand',
      title: 'Brand/Manufacturer',
      type: 'string',
      options: {
        list: [
          { title: 'John Deere', value: 'John Deere' },
          { title: 'Case IH', value: 'Case IH' },
          { title: 'New Holland', value: 'New Holland' },
          { title: 'Kubota', value: 'Kubota' },
          { title: 'Massey Ferguson', value: 'Massey Ferguson' },
          { title: 'Caterpillar', value: 'Caterpillar' },
          { title: 'AGCO', value: 'AGCO' },
          { title: 'Claas', value: 'Claas' },
          { title: 'Fendt', value: 'Fendt' },
          { title: 'Mahindra', value: 'Mahindra' },
          { title: 'Yanmar', value: 'Yanmar' },
          { title: 'Stihl', value: 'Stihl' },
          { title: 'Husqvarna', value: 'Husqvarna' },
          { title: 'Other', value: 'Other' }
        ]
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'model',
      title: 'Model Number',
      type: 'string',
      description: 'Specific model number or designation'
    },
    {
      name: 'manufacturingYear',
      title: 'Manufacturing Year',
      type: 'number',
      validation: Rule => Rule.min(1990).max(new Date().getFullYear() + 2),
      description: 'Year the equipment was manufactured'
    },

    // Equipment Category & Type
    {
      name: 'category',
      title: 'Equipment Category',
      type: 'string',
      options: {
        list: [
          { title: 'Tractors', value: 'tractors' },
          { title: 'Harvesters', value: 'harvesters' },
          { title: 'Planters & Seeders', value: 'planters' },
          { title: 'Irrigation Systems', value: 'irrigation' },
          { title: 'Tillage Equipment', value: 'tillage' },
          { title: 'Sprayers', value: 'sprayers' },
          { title: 'Mowers', value: 'mowers' },
          { title: 'Balers', value: 'balers' },
          { title: 'Cultivators', value: 'cultivators' },
          { title: 'Fertilizer Spreaders', value: 'fertilizer-spreaders' },
          { title: 'GPS & Precision Farming', value: 'precision-farming' },
          { title: 'Livestock Equipment', value: 'livestock' },
          { title: 'Post-Harvest Equipment', value: 'post-harvest' },
          { title: 'Greenhouse Equipment', value: 'greenhouse' },
          { title: 'Farm Tools & Implements', value: 'tools-implements' }
        ]
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'subcategory',
      title: 'Subcategory',
      type: 'string',
      description: 'More specific classification (e.g., "Compact Tractors", "Drip Irrigation")'
    },
    {
      name: 'condition',
      title: 'Equipment Condition',
      type: 'string',
      options: {
        list: [
          { title: 'Brand New', value: 'new' },
          { title: 'Like New', value: 'like-new' },
          { title: 'Excellent', value: 'excellent' },
          { title: 'Good', value: 'good' },
          { title: 'Fair', value: 'fair' },
          { title: 'Needs Repair', value: 'repair-needed' }
        ]
      },
      initialValue: 'new'
    },

    // Technical Specifications
    {
      name: 'specifications',
      title: 'Technical Specifications',
      type: 'object',
      fields: [
        {
          name: 'enginePower',
          title: 'Engine Power (HP)',
          type: 'number',
          description: 'Horsepower rating'
        },
        {
          name: 'engineType',
          title: 'Engine Type',
          type: 'string',
          description: 'Engine specifications (e.g., "Diesel 4-cylinder turbo")'
        },
        {
          name: 'fuelType',
          title: 'Fuel Type',
          type: 'string',
          options: {
            list: [
              { title: 'Diesel', value: 'diesel' },
              { title: 'Gasoline', value: 'gasoline' },
              { title: 'Electric', value: 'electric' },
              { title: 'Hybrid', value: 'hybrid' },
              { title: 'Manual/Non-powered', value: 'manual' },
              { title: 'Propane/LPG', value: 'propane' }
            ]
          }
        },
        {
          name: 'workingWidth',
          title: 'Working Width (meters)',
          type: 'number',
          description: 'Operating width in meters'
        },
        {
          name: 'workingDepth',
          title: 'Working Depth (cm)',
          type: 'number',
          description: 'Maximum working depth in centimeters'
        },
        {
          name: 'weight',
          title: 'Weight (kg)',
          type: 'number',
          description: 'Total weight in kilograms'
        },
        {
          name: 'dimensions',
          title: 'Dimensions (L x W x H)',
          type: 'string',
          placeholder: 'e.g., 4.2m x 2.1m x 2.8m',
          description: 'Overall dimensions'
        },
        {
          name: 'capacity',
          title: 'Capacity/Output',
          type: 'string',
          description: 'Performance capacity (e.g., "5 hectares/hour", "500L tank")'
        },
        {
          name: 'attachmentPoints',
          title: 'Attachment Points',
          type: 'string',
          description: 'Compatible attachment systems (e.g., "3-point hitch", "PTO")'
        },
        {
          name: 'groundClearance',
          title: 'Ground Clearance (cm)',
          type: 'number',
          description: 'Minimum ground clearance'
        }
      ],
      description: 'Detailed technical specifications'
    },

    // Farming Applications
    {
      name: 'cropTypes',
      title: 'Suitable Crop Types',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Rice', value: 'rice' },
          { title: 'Corn/Maize', value: 'corn' },
          { title: 'Wheat', value: 'wheat' },
          { title: 'Sugarcane', value: 'sugarcane' },
          { title: 'Soybeans', value: 'soybeans' },
          { title: 'Cotton', value: 'cotton' },
          { title: 'Vegetables', value: 'vegetables' },
          { title: 'Fruits', value: 'fruits' },
          { title: 'Coffee', value: 'coffee' },
          { title: 'Cocoa', value: 'cocoa' },
          { title: 'Citrus', value: 'citrus' },
          { title: 'Bananas', value: 'bananas' },
          { title: 'Coconuts', value: 'coconuts' },
          { title: 'Pasture/Grassland', value: 'pasture' },
          { title: 'Universal/All Crops', value: 'universal' }
        ]
      },
      description: 'Types of crops this equipment can handle'
    },
    {
      name: 'farmSize',
      title: 'Recommended Farm Size',
      type: 'string',
      options: {
        list: [
          { title: 'Small Farm (0-5 hectares)', value: 'small' },
          { title: 'Medium Farm (5-20 hectares)', value: 'medium' },
          { title: 'Large Farm (20-100 hectares)', value: 'large' },
          { title: 'Commercial Farm (100+ hectares)', value: 'commercial' },
          { title: 'Any Size', value: 'any' }
        ]
      }
    },
    {
      name: 'terrainType',
      title: 'Suitable Terrain',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'Flat Land', value: 'flat' },
          { title: 'Hilly Terrain', value: 'hilly' },
          { title: 'Rough Terrain', value: 'rough' },
          { title: 'Paddy Fields', value: 'paddy' },
          { title: 'Greenhouse', value: 'greenhouse' },
          { title: 'Orchard', value: 'orchard' },
          { title: 'Coastal Areas', value: 'coastal' },
          { title: 'Mountain Slopes', value: 'mountain' }
        ]
      }
    },

    // Technology Features
    {
      name: 'technology',
      title: 'Technology Features',
      type: 'object',
      fields: [
        {
          name: 'gpsEnabled',
          title: 'GPS Enabled',
          type: 'boolean',
          initialValue: false
        },
        {
          name: 'autopilot',
          title: 'Auto-pilot/Auto-steer',
          type: 'boolean',
          initialValue: false
        },
        {
          name: 'precisionFarming',
          title: 'Precision Farming Compatible',
          type: 'boolean',
          initialValue: false
        },
        {
          name: 'iotEnabled',
          title: 'IoT/Smart Connectivity',
          type: 'boolean',
          initialValue: false
        },
        {
          name: 'mobileApp',
          title: 'Mobile App Integration',
          type: 'boolean',
          initialValue: false
        },
        {
          name: 'dataLogging',
          title: 'Data Logging/Analytics',
          type: 'boolean',
          initialValue: false
        },
        {
          name: 'remoteMonitoring',
          title: 'Remote Monitoring',
          type: 'boolean',
          initialValue: false
        },
        {
          name: 'bluetoothEnabled',
          title: 'Bluetooth Connectivity',
          type: 'boolean',
          initialValue: false
        }
      ]
    },

    // Service & Purchase Information
    {
      name: 'hoursUsed',
      title: 'Hours Used (for used equipment)',
      type: 'number',
      description: 'Operating hours for used equipment'
    },
    {
      name: 'warranty',
      title: 'Warranty Period',
      type: 'string',
      placeholder: 'e.g., "2 years", "12 months parts & labor"'
    },
    {
      name: 'whatsInTheBox',
      title: "What's In The Box",
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Items included (e.g., 1x Device, USB-C Cable, Charger, Manual)',
    },
    {
      name: 'financing',
      title: 'Financing Available',
      type: 'boolean',
      initialValue: false
    },
    {
      name: 'deliveryIncluded',
      title: 'Delivery Included',
      type: 'boolean',
      initialValue: false
    },
    {
      name: 'installationService',
      title: 'Installation Service Available',
      type: 'boolean',
      initialValue: false
    },
    {
      name: 'trainingIncluded',
      title: 'Operator Training Included',
      type: 'boolean',
      initialValue: false
    },
    {
      name: 'maintenancePackage',
      title: 'Maintenance Package Available',
      type: 'boolean',
      initialValue: false
    },

    // Location & Availability
    {
      name: 'location',
      title: 'Available Location',
      type: 'string',
      options: {
        list: [
          { title: 'Port of Spain', value: 'port-of-spain' },
          { title: 'San Fernando', value: 'san-fernando' },
          { title: 'Chaguanas', value: 'chaguanas' },
          { title: 'Arima', value: 'arima' },
          { title: 'Point Fortin', value: 'point-fortin' },
          { title: 'Tobago', value: 'tobago' },
          { title: 'Central Trinidad', value: 'central' },
          { title: 'South Trinidad', value: 'south' },
          { title: 'North Trinidad', value: 'north' },
          { title: 'East Trinidad', value: 'east' },
          { title: 'Import Order (2-4 weeks)', value: 'import-order' },
          { title: 'Special Order', value: 'special-order' }
        ]
      }
    },
    {
      name: 'deliveryRadius',
      title: 'Delivery Radius (km)',
      type: 'number',
      description: 'Maximum delivery distance in kilometers'
    },

    // Marketing & SEO
    {
      name: 'featured',
      title: 'Featured Product',
      type: 'boolean',
      initialValue: false
    },
    {
      name: 'onSale',
      title: 'On Sale',
      type: 'boolean',
      initialValue: false
    },
    {
      name: 'bestSeller',
      title: 'Best Seller',
      type: 'boolean',
      initialValue: false
    },
    {
      name: 'newArrival',
      title: 'New Arrival',
      type: 'boolean',
      initialValue: false
    },
    {
      name: 'tags',
      title: 'Product Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags'
      },
      description: 'Tags for filtering and search'
    },
    {
      name: 'seoTitle',
      title: 'SEO Title',
      type: 'string',
      validation: Rule => Rule.max(60),
      description: 'SEO optimized page title'
    },
    {
      name: 'seoDescription',
      title: 'SEO Description',
      type: 'text',
      validation: Rule => Rule.max(160),
      description: 'SEO meta description'
    },

    // Additional Product Information
    {
      name: 'features',
      title: 'Key Features',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'List of key product features and benefits'
    },
    {
      name: 'included',
      title: 'What\'s Included',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Items included with the product'
    },
    {
      name: 'requirements',
      title: 'Requirements',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Requirements for operation (power, space, etc.)'
    },

    // Marketing Content
    {
      name: 'marketingHeadline',
      title: 'Marketing Headline',
      type: 'string',
      description: 'Main headline for social media and marketing posts'
    },
    {
      name: 'marketingCaption',
      title: 'Marketing Caption',
      type: 'text',
      rows: 5,
      description: 'Full caption for social media posts (Instagram, Facebook, etc.)'
    },
    {
      name: 'marketingHashtags',
      title: 'Marketing Hashtags',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'Hashtags for social media posts'
    },
    {
      name: 'details',
      title: 'Product Details',
      type: 'text',
      rows: 6,
      description: 'Additional product details and selling points'
    },
    {
      name: 'keywoards',
      title: 'Keywords (SEO)',
      type: 'array',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
      description: 'SEO keywords for search indexing'
    },

    // Admin Fields
    {
      name: 'productCode',
      title: 'Internal Product Code',
      type: 'string',
      description: 'Internal inventory/catalog reference'
    },
    {
      name: 'supplier',
      title: 'Supplier/Dealer',
      type: 'string',
      description: 'Primary supplier or dealer'
    },
    {
      name: 'leadTime',
      title: 'Lead Time',
      type: 'string',
      description: 'Expected delivery time (e.g., "In Stock", "2-3 weeks")'
    },
    {
      name: 'publishedAt',
      title: 'Published Date',
      type: 'datetime',
      initialValue: () => new Date().toISOString()
    },
    {
      name: 'shippingWeightKg',
      title: 'Shipping Weight (kg)',
      type: 'number',
      description: 'Package weight in kilograms for shipping calculation',
      group: 'shipping',
    },
    {
      name: 'shippingLengthCm',
      title: 'Package Length (cm)',
      type: 'number',
      description: 'Package length in centimeters',
      group: 'shipping',
    },
    {
      name: 'shippingWidthCm',
      title: 'Package Width (cm)',
      type: 'number',
      description: 'Package width in centimeters',
      group: 'shipping',
    },
    {
      name: 'shippingHeightCm',
      title: 'Package Height (cm)',
      type: 'number',
      description: 'Package height in centimeters',
      group: 'shipping',
    },
  ],
  
  // Document Preview
  preview: {
    select: {
      title: 'name',
      subtitle: 'brand',
      media: 'image.0',
      category: 'category',
      price: 'price'
    },
    prepare(selection) {
      const { title, subtitle, media, category, price } = selection;
      return {
        title: title,
        subtitle: `${subtitle} - ${category} - $${price}`,
        media: media
      };
    }
  },

  // Document ordering
  orderings: [
    {
      title: 'Name A-Z',
      name: 'nameAsc',
      by: [{ field: 'name', direction: 'asc' }]
    },
    {
      title: 'Price (Low to High)',
      name: 'priceAsc',
      by: [{ field: 'price', direction: 'asc' }]
    },
    {
      title: 'Price (High to Low)',
      name: 'priceDesc',
      by: [{ field: 'price', direction: 'desc' }]
    },
    {
      title: 'Newest First',
      name: 'publishedDesc',
      by: [{ field: 'publishedAt', direction: 'desc' }]
    },
    {
      title: 'Featured First',
      name: 'featuredFirst',
      by: [
        { field: 'featured', direction: 'desc' },
        { field: 'publishedAt', direction: 'desc' }
      ]
    },
    {
      title: 'Category',
      name: 'categoryAsc',
      by: [
        { field: 'category', direction: 'asc' },
        { field: 'name', direction: 'asc' }
      ]
    }
  ]
};

// Don't forget to add this to your schema index file:
// schemas/index.js
/*
import agritechPage from './agritechPage'

export const schemaTypes = [
  // ... your existing schemas
  agritechPage,
]
*/