'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function BlogPage() {
  const posts = [
    {
      slug: 'top-5-features-rugged-smartphone',
      title: 'Top 5 Features to Look for in a Rugged Smartphone',
      excerpt: 'When choosing a rugged smartphone, there are key features that separate the truly durable from the merely marketed. Learn what really matters.',
      date: 'Jan 8, 2026',
      category: 'Buying Guide',
      readTime: '5 min read',
      image: '/blog-images/rugged_smartphone_construction_site.png'
    },
    {
      slug: 'farming-equipment-maintenance',
      title: 'How to Maintain Your Farming Equipment for Longevity',
      excerpt: 'Regular maintenance is key to getting the most out of your agricultural equipment investment. Here\'s our comprehensive guide.',
      date: 'Jan 2, 2026',
      category: 'Tips & Guides',
      readTime: '7 min read',
      image: '/blog-images/tractor_in_wheat_field.png'
    },
    {
      slug: 'evolution-rugged-technology',
      title: 'The Evolution of Rugged Technology: From Military to Everyday Use',
      excerpt: 'Explore how rugged technology has evolved from specialized military equipment to consumer products we use today.',
      date: 'Dec 28, 2025',
      category: 'Industry Insights',
      readTime: '6 min read',
      image: '/blog-images/military_rugged_tablet_gear.png'
    },
    {
      slug: 'understanding-ip-ratings',
      title: 'Understanding IP Ratings: What IP68 Really Means',
      excerpt: 'IP ratings can be confusing. We break down what each number means and how it applies to your devices.',
      date: 'Dec 20, 2025',
      category: 'Education',
      readTime: '4 min read',
      image: '/blog-images/waterproof_phone_underwater.png'
    },
    {
      slug: 'suzuki-maintenance-off-road',
      title: 'Best Suzuki Maintenance Tips for Off-Road Enthusiasts',
      excerpt: 'Keep your Suzuki running strong with these essential maintenance practices for off-road adventures.',
      date: 'Dec 15, 2025',
      category: 'Tips & Guides',
      readTime: '8 min read',
      image: '/blog-images/suzuki_off-road_adventure.png'
    }
  ];

  return (
    <>
      <main className="blog-page">
        <div className="page-banner">
          <div className="banner-content">
            <h1>RUGGTECH Blog</h1>
            <p>Tips, guides, and insights for rugged living</p>
          </div>
        </div>

        <div className="container">
          <div className="featured-post">
            <Link href={`/company/blog/${posts[0].slug}`} className="featured-link">
              <div className="featured-image">
                <Image 
                  src={posts[0].image} 
                  alt={posts[0].title}
                  fill
                  style={{ objectFit: 'cover' }}
                  priority
                />
                <div className="featured-overlay">
                  <span className="category-tag">{posts[0].category}</span>
                  <h2>{posts[0].title}</h2>
                  <p>{posts[0].excerpt}</p>
                  <div className="post-meta">
                    <span>{posts[0].date}</span>
                    <span className="separator">|</span>
                    <span>{posts[0].readTime}</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          <div className="blog-grid">
            {posts.slice(1).map((post, index) => (
              <Link href={`/company/blog/${post.slug}`} key={index} className="blog-card-link">
                <article className="blog-card">
                  <div className="blog-image">
                    <Image 
                      src={post.image} 
                      alt={post.title}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                    <span className="category-tag">{post.category}</span>
                  </div>
                  <div className="blog-content">
                    <h2>{post.title}</h2>
                    <p>{post.excerpt}</p>
                    <div className="blog-meta">
                      <span>{post.date}</span>
                      <span className="separator">|</span>
                      <span>{post.readTime}</span>
                    </div>
                    <span className="read-btn">Read Article <i className="fas fa-arrow-right"></i></span>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          <div className="newsletter-section">
            <div className="newsletter-content">
              <i className="fas fa-envelope newsletter-icon"></i>
              <h2>Stay Updated</h2>
              <p>Subscribe to our newsletter for the latest tips, product news, and exclusive deals.</p>
              <form className="newsletter-form" onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing!'); }}>
                <input type="email" placeholder="Enter your email" required />
                <button type="submit">Subscribe</button>
              </form>
            </div>
          </div>
        </div>
      </main>

      <style jsx>{`
        .blog-page { 
          min-height: 100vh; 
          background: var(--bg-color); 
        }
        .page-banner {
          background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
          padding: 80px 20px;
          text-align: center;
          color: white;
        }
        .banner-content h1 { 
          font-size: 48px; 
          margin-bottom: 15px; 
          font-weight: 700;
        }
        .banner-content p { 
          font-size: 20px; 
          opacity: 0.9; 
        }
        .container { 
          max-width: 1200px; 
          margin: 0 auto; 
          padding: 50px 20px 80px; 
        }
        
        .featured-post {
          margin-bottom: 50px;
        }
        .featured-link {
          text-decoration: none;
          display: block;
          color: inherit;
        }
        .featured-link:hover {
          text-decoration: none;
        }
        .featured-link h2,
        .featured-link p,
        .featured-link span {
          text-decoration: none;
        }
        .featured-image {
          position: relative;
          height: 450px;
          border-radius: 20px;
          overflow: hidden;
        }
        .featured-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.1) 100%);
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 40px;
          color: white;
        }
        .featured-overlay h2 {
          font-size: 32px;
          margin-bottom: 15px;
          line-height: 1.3;
        }
        .featured-overlay p {
          font-size: 16px;
          opacity: 0.9;
          margin-bottom: 15px;
          max-width: 600px;
        }
        .post-meta {
          display: flex;
          gap: 10px;
          font-size: 14px;
          opacity: 0.8;
        }
        .separator { opacity: 0.5; }

        .blog-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 30px;
          margin-bottom: 60px;
        }
        .blog-card-link {
          text-decoration: none;
          color: inherit;
        }
        .blog-card-link:hover {
          text-decoration: none;
        }
        .blog-card-link h2,
        .blog-card-link p,
        .blog-card-link span {
          text-decoration: none;
        }
        .blog-card {
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          overflow: hidden;
          transition: transform 0.3s, box-shadow 0.3s;
          height: 100%;
        }
        .blog-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0,0,0,0.3);
        }
        .blog-image {
          height: 200px;
          position: relative;
        }
        .category-tag {
          position: absolute;
          top: 15px;
          left: 15px;
          background: var(--accent);
          color: white;
          padding: 6px 14px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          z-index: 2;
        }
        .featured-overlay .category-tag {
          position: static;
          display: inline-block;
          margin-bottom: 15px;
          width: fit-content;
        }
        .blog-content { 
          padding: 25px; 
        }
        .blog-content h2 { 
          font-size: 18px; 
          margin-bottom: 12px; 
          line-height: 1.4;
          color: var(--text-light);
        }
        .blog-content p { 
          color: var(--text-gray); 
          font-size: 14px; 
          line-height: 1.6; 
          margin-bottom: 15px;
        }
        .blog-meta { 
          font-size: 13px; 
          color: var(--text-gray); 
          margin-bottom: 15px;
          display: flex;
          gap: 8px;
        }
        .read-btn {
          color: var(--accent);
          font-weight: 600;
          font-size: 14px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: gap 0.2s;
        }
        .blog-card:hover .read-btn {
          gap: 12px;
        }

        .newsletter-section {
          background: linear-gradient(135deg, var(--card-bg) 0%, rgba(59,130,246,0.1) 100%);
          border: 1px solid var(--border-color);
          border-radius: 20px;
          padding: 60px 40px;
          text-align: center;
        }
        .newsletter-content {
          max-width: 500px;
          margin: 0 auto;
        }
        .newsletter-icon {
          font-size: 40px;
          color: var(--accent);
          margin-bottom: 20px;
        }
        .newsletter-section h2 { 
          color: var(--text-light); 
          margin-bottom: 15px;
          font-size: 28px;
        }
        .newsletter-section p { 
          color: var(--text-gray); 
          margin-bottom: 25px;
          font-size: 16px;
        }
        .newsletter-form { 
          display: flex; 
          gap: 12px;
          max-width: 450px;
          margin: 0 auto;
        }
        .newsletter-form input {
          flex: 1;
          padding: 14px 20px;
          border: 1px solid var(--border-color);
          border-radius: 10px;
          background: var(--bg-color);
          color: var(--text-light);
          font-size: 15px;
        }
        .newsletter-form input:focus {
          outline: none;
          border-color: var(--accent);
        }
        .newsletter-form button {
          background: var(--accent);
          color: white;
          padding: 14px 28px;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
        }
        .newsletter-form button:hover {
          background: #2563eb;
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .banner-content h1 { font-size: 32px; }
          .featured-image { height: 350px; }
          .featured-overlay { padding: 25px; }
          .featured-overlay h2 { font-size: 24px; }
          .blog-grid { grid-template-columns: 1fr; }
          .newsletter-section { padding: 40px 20px; }
          .newsletter-form { flex-direction: column; }
          .newsletter-form button { width: 100%; }
        }
      `}</style>
    </>
  );
}
