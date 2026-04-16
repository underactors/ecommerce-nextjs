// app/search/page.js
'use client';
import { Suspense } from 'react';
import SearchResults from './SearchResults';

// Loading component for Suspense fallback
function SearchLoading() {
  return (
    <div className="container">
      <div className="search-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading search...</p>
        </div>
      </div>
      
      <style jsx>{`
        .search-page {
          padding: 40px 0;
          min-height: 60vh;
        }
        
        .loading-state {
          text-align: center;
          padding: 60px 20px;
          color: var(--text-gray);
        }
        
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid var(--border);
          border-top: 4px solid var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// Main page component with Suspense wrapper
export default function SearchPage() {
  return (
    <Suspense fallback={<SearchLoading />}>
      <SearchResults />
    </Suspense>
  );
}