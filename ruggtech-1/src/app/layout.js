// app/layout.js - CLEAN VERSION WITH NO META TAGS
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import '@fortawesome/fontawesome-free/css/all.min.css';
import Header from "./components/Header";
import Footer from "./components/Footer";
import ClientWrapper from './ClientWrapper';
import { Inter } from 'next/font/google';
import { CartProvider } from './context/CartContext';
import { Analytics } from "@vercel/analytics/next"
import { ClerkProvider } from '@clerk/nextjs'
import { WishlistProvider } from './context/WishlistContext'
import { RecentlyViewedProvider } from './context/RecentlyViewedContext'
import { CurrencyProvider } from './context/CurrencyContext'
import FacebookPixel from './components/FacebookPixel'
import ExitIntentPopup from './components/ExitIntentPopup'
import AbandonedCartTracker from './components/AbandonedCartTracker'
import { WebsiteSchema, OrganizationSchema } from './components/ProductSchema'
import WhatsAppButton from './components/WhatsAppButton'
import ChatAssistant from './components/ChatAssistant'
import { Suspense } from 'react'

const inter = Inter({ subsets: ['latin'] });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Default fallback metadata only
export const metadata = {
  title: {
    default: 'RUGGTECH - Premium Rugged Devices, Auto Parts & Tech Products',
    template: '%s | RUGGTECH'
  },
  description: 'Premium rugged devices, Suzuki parts, phones, tablets, and agricultural equipment. Fast shipping and expert support.',
  keywords: 'auto parts, Suzuki parts, tech products, watches, phones, agricultural equipment, car accessories, automotive components, OEM parts',
  authors: [{ name: 'RUGGTECH' }],
  creator: 'RUGGTECH',
  publisher: 'RUGGTECH',
  metadataBase: new URL('https://ruggtech.com'),
  icons: {
    icon: [
      { url: '/images/logo-icon.png', sizes: '192x192', type: 'image/png' },
      { url: '/images/logo-icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/images/logo-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/images/logo-icon.png',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ruggtech.com',
    siteName: 'RUGGTECH',
    title: 'RUGGTECH - Premium Auto Parts & Tech Products',
    description: 'Your trusted source for high-quality automotive parts, Suzuki components, tech products, and agricultural equipment.',
    images: [
      {
        url: '/test.png',
        width: 1200,
        height: 630,
        alt: 'RUGGTECH - Premium Products',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RUGGTECH - Premium Auto Parts & Tech Products',
    description: 'Your trusted source for high-quality automotive parts and tech products.',
    creator: '@ruggtech',
    images: ['/test.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://ruggtech.com',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ClerkProvider>
          <Suspense fallback={null}>
            <FacebookPixel />
          </Suspense>
          <ClientWrapper>
            <CurrencyProvider>
            <CartProvider>
             <WishlistProvider>
              <RecentlyViewedProvider>
                <Header />
                {children}
                <Analytics/>
                <Footer/>
                <WhatsAppButton />
                <ChatAssistant />
                <ExitIntentPopup />
                <AbandonedCartTracker />
                <WebsiteSchema />
                <OrganizationSchema />
              </RecentlyViewedProvider>
             </WishlistProvider>
            </CartProvider>
            </CurrencyProvider>
          </ClientWrapper>
        </ClerkProvider>
      </body>
    </html>
  );
}