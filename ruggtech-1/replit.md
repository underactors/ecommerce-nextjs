# RUGGTECH E-commerce Store

## Overview
RUGGTECH is a Next.js 16 e-commerce application focusing on rugged devices, tablets, Suzuki parts, farming equipment, and accessories. It provides a robust online shopping experience with integrated CMS, secure authentication, and diverse payment options. The platform targets a niche market for durable technology and specialized equipment, aiming for user experience and conversion optimization. It includes a comprehensive content management system, secure authentication, and various payment options, with a business vision to dominate the specialized rugged and equipment e-commerce market.

## User Preferences
- Prioritize clear and concise communication.
- Focus on iterative development.
- Ask before making major architectural changes.
- Provide detailed explanations for significant code modifications.
- Do not make changes to files within the `sanity_ecommerce/` directory (unless explicitly approved by the user).
- **Mobile-first design is mandatory**: ALL UI changes must be optimized for mobile view from the start. Never build desktop-only and retrofit for mobile later.

## System Architecture

### UI/UX Decisions
The storefront features custom RUGGTECH branding with a tech/rugged aesthetic, including a VR skull icon logo and a circular badge watermark with pulse animation on carousel banners. Navigation uses pill-style category buttons, and category pages follow a consistent layout with gradient banners, stats cards, and product grids. The design is responsive and mobile-first. Product detail pages use a shared CSS module for consistent layout, including image galleries, trust badges, a shipping calculator, accordion sections for details, and category-specific specifications.

### Technical Implementations
The application is built with Next.js 16 using the App Router and Turbopack. Sanity.io serves as the headless CMS, and Clerk handles user authentication. Styling is managed with CSS Modules, and Font Awesome is used for icons. A React Native/Expo mobile app (`ruggtech-mobile/`) provides a native experience with full feature parity to the web app, using Zustand for state management and Expo Router for navigation.

### Feature Specifications
- **Core E-commerce**: Category pages with specific filters, homepage hero carousel, product detail pages, and a pre-sale system with geo-targeting.
- **Sales & Marketing**: Deals system, shareable wishlists, stock urgency badges, countdown timers, recently viewed products, customer testimonials, customer reviews, cross-selling/related products, exit-intent popups, abandoned cart recovery, product filters, and search autocomplete.
- **Order Management**: Order tracking system with visual timeline and carrier auto-detection, shipping address collection, and an admin dashboard for store and order management.
- **Inventory Management**: A comprehensive web inventory management system within the admin dashboard including stock dashboards, inline editing, bulk updates, stock history, CSV export, stock alerts, back-in-stock notifications, and auto-decrement on orders.
- **Wholesale System**: Shareable, dark-themed wholesale catalog pages with product grids, quantity selectors, customer forms, and order submission directly integrated with Sanity and Notion.
- **SEO Optimizations**: Dynamic sitemap generation, `robots.txt`, JSON-LD structured data (Product, Organization, Website, Breadcrumb), and optimized image components.
- **Promo Codes**: Full-featured promotional codes with percentage discounts, usage limits, and expiration dates, validated server-side.

## External Dependencies
- **Authentication**: Clerk
- **CMS**: Sanity.io
- **CRM/Analytics**: Notion (for customer order tracking, search tracking, product views, stock history, and wholesale orders)
- **Payments**: PayPal, Stripe, Google Pay, NOWPayments (cryptocurrency), Braintree
- **Shipping**: Shippo (for real-time shipping rate calculations)
- **Email**: Nodemailer (via SMTP)
- **Geo-targeting**: ip-api.com