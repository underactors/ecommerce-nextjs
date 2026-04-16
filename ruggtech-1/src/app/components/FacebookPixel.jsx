'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';

const FB_PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID;

export const pageview = () => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'PageView');
  }
};

export const event = (name, options = {}) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', name, options);
  }
};

export const trackAddToCart = (product) => {
  event('AddToCart', {
    content_name: product.name,
    content_ids: [product._id],
    content_type: 'product',
    value: product.price,
    currency: 'USD',
  });
};

export const trackViewContent = (product) => {
  event('ViewContent', {
    content_name: product.name,
    content_ids: [product._id],
    content_type: 'product',
    value: product.price,
    currency: 'USD',
  });
};

export const trackInitiateCheckout = (cart, total) => {
  event('InitiateCheckout', {
    content_ids: cart.map(item => item._id),
    content_type: 'product',
    value: total,
    currency: 'USD',
    num_items: cart.length,
  });
};

export const trackPurchase = (orderId, total, products) => {
  event('Purchase', {
    content_ids: products.map(p => p._id),
    content_type: 'product',
    value: total,
    currency: 'USD',
    order_id: orderId,
  });
};

export const trackSearch = (searchQuery) => {
  event('Search', {
    search_string: searchQuery,
  });
};

export default function FacebookPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!FB_PIXEL_ID) return;
    pageview();
  }, [pathname, searchParams]);

  if (!FB_PIXEL_ID) {
    return null;
  }

  return (
    <>
      <Script
        id="facebook-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${FB_PIXEL_ID}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
