"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';

function ProductsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const category = searchParams.get('category');

  useEffect(() => {
    if (category === 'deals') {
      router.replace('/deals');
    } else if (category === 'agritech') {
      router.replace('/');
    } else if (category === 'suzuki') {
      router.replace('/');
    } else {
      router.replace('/');
    }
  }, [category, router]);

  return (
    <div className="container" style={{ 
      minHeight: '60vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <p style={{ color: 'var(--text-gray)' }}>Redirecting...</p>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="container" style={{ 
        minHeight: '60vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <p style={{ color: 'var(--text-gray)' }}>Loading...</p>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
