# Ruggtech

Ruggtech is a full-stack e-commerce platform for rugged devices, smartphones, agricultural equipment, and Suzuki OEM parts. The project consists of a Next.js web storefront, a companion Expo (React Native) mobile app, and a Sanity CMS backend powering both clients from a single content source.

Live site: [ruggtech.com](https://ruggtech.com)

---

## Project Structure

```
ruggtech-1/
├── ruggtech-1/              # Next.js 16 web storefront
│   ├── src/app/             # App Router pages, components, contexts
│   ├── public/              # Static assets
│   └── package.json
│
├── ruggtech-mobile/         # Expo / React Native mobile app
│   ├── app/                 # Expo Router screens
│   ├── components/
│   └── lib/sanity.ts        # Shared Sanity client
│
└── sanity_ecommerce/        # Sanity Studio (CMS)
    └── schemas/             # Product, category, and order schemas
```

---

## Web Application

A server-rendered Next.js storefront with Sanity-backed content, Clerk authentication, PayPal checkout, and Shippo-powered shipping.

### Tech Stack

- **Framework:** Next.js 16.1 (App Router, Turbopack)
- **UI:** React 19, FontAwesome, custom CSS
- **CMS:** Sanity (`@sanity/client`, `next-sanity`) with GROQ queries
- **Auth:** Clerk (`@clerk/nextjs`)
- **Payments:** PayPal (`@paypal/react-paypal-js`)
- **Shipping:** Shippo (`shippo`)
- **Email:** Nodemailer
- **Analytics:** Vercel Analytics
- **Integrations:** Notion API for admin/order syncing

### Key Features

- Multi-category product catalog (rugged devices, phones & tablets, agricultural equipment, Suzuki parts)
- Sanity-driven product pages with color variants, image galleries, and rich specifications
- Cart, wishlist, and recently-viewed contexts persisted to `localStorage`
- Multi-currency support (USD, TTD, EUR, GBP, CAD, JMD, BBD) with live conversion across all product cards and checkout
- Server-side Open Graph metadata for rich social link previews (Facebook, X, LinkedIn)
- Clerk-secured user accounts and order history
- PayPal checkout with Shippo shipping rate calculation and label generation
- Cross-selling / "Frequently Bought Together" recommendations
- Responsive header with mobile drawer, account links, and inline currency picker
- Admin tools for order management and Notion sync

### Run Locally

```bash
cd ruggtech-1
npm install
npm run dev   # Turbopack on port 5000
```

---

## Mobile Application

A cross-platform Expo app sharing the same Sanity content as the web store, built with Expo Router and TypeScript.

### Tech Stack

- **Framework:** Expo (React Native) with Expo Router
- **Language:** TypeScript
- **CMS:** Shared Sanity client (`lib/sanity.ts`)
- **Navigation:** File-based routing via Expo Router
- **State:** React Context (cart, wishlist, currency)

### Key Features

- Native product browsing for all categories from the same Sanity backend
- Color variant gallery with per-color image sets
- Cart and checkout flows
- Branded header matching the web store (RUGGTECH wordmark + tagline)
- Account, wishlist, and order tracking screens

### Run Locally

```bash
cd ruggtech-mobile
npm install
npx expo start
```

---

## Sanity CMS

Custom Sanity Studio with schemas for each product category (`product`, `phones`, `phoneacc`, `product2`, `watch`, `electronic`, `car`, `agritechPage`), orders, customers, and marketing content. Includes a "Colors & Variant Images" group for managing per-color product imagery and marketing fields (headline, caption, hashtags) for social sharing.

### Deploy Studio

```bash
cd sanity_ecommerce
npx sanity deploy
```

---

## License

This repository is **proprietary and source-available for review only**. See [LICENSE.md](./LICENSE.md) for full terms. No use, copying, modification, redistribution, or derivative works are permitted.

---

## Contact

For inquiries, contact the project owner via [ruggtech.com](https://ruggtech.com).
