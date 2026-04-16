'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function AboutUsPage() {
  return (
    <>
      <Header />
      <main className="company-page">
        <div className="page-banner">
          <h1>About RUGGTECH</h1>
          <p>Built Tough. Designed Smart. Made for You.</p>
        </div>

        <div className="container">
          <section className="story-section">
            <div className="story-content">
              <h2>Our Story</h2>
              <p>Founded with a mission to provide durable, reliable technology and equipment for those who work and play in demanding environments, RUGGTECH has grown from a small startup to a trusted name in rugged devices and specialized equipment.</p>
              <p>We understand that your tools need to be as tough as you are. That's why we source and develop products that can withstand the harshest conditions while delivering exceptional performance.</p>
            </div>
            <div className="story-image">
              <div className="image-placeholder">🏔️</div>
            </div>
          </section>

          <section className="values-section">
            <h2>Our Core Values</h2>
            <div className="values-grid">
              <div className="value-card">
                <div className="value-icon">💪</div>
                <h3>Durability</h3>
                <p>Every product we offer is tested to withstand extreme conditions.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">🎯</div>
                <h3>Quality</h3>
                <p>We never compromise on materials or craftsmanship.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">🤝</div>
                <h3>Trust</h3>
                <p>Building lasting relationships with our customers through reliability.</p>
              </div>
              <div className="value-card">
                <div className="value-icon">🚀</div>
                <h3>Innovation</h3>
                <p>Constantly improving and adapting to meet your needs.</p>
              </div>
            </div>
          </section>

          <section className="stats-section">
            <div className="stat">
              <div className="stat-number">10K+</div>
              <div className="stat-label">Happy Customers</div>
            </div>
            <div className="stat">
              <div className="stat-number">500+</div>
              <div className="stat-label">Products</div>
            </div>
            <div className="stat">
              <div className="stat-number">50+</div>
              <div className="stat-label">Countries Served</div>
            </div>
            <div className="stat">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Support</div>
            </div>
          </section>

          <section className="team-section">
            <h2>Leadership Team</h2>
            <p className="team-intro">Our experienced team brings decades of expertise in technology, manufacturing, and customer service.</p>
            <div className="team-grid">
              <div className="team-member">
                <div className="member-avatar">👤</div>
                <h4>John Smith</h4>
                <p>CEO & Founder</p>
              </div>
              <div className="team-member">
                <div className="member-avatar">👤</div>
                <h4>Sarah Johnson</h4>
                <p>Chief Operations Officer</p>
              </div>
              <div className="team-member">
                <div className="member-avatar">👤</div>
                <h4>Mike Chen</h4>
                <p>Chief Technology Officer</p>
              </div>
              <div className="team-member">
                <div className="member-avatar">👤</div>
                <h4>Emily Davis</h4>
                <p>Head of Customer Success</p>
              </div>
            </div>
          </section>
        </div>

        <style jsx>{`
          .company-page { min-height: 100vh; background: var(--bg-color); }
          .page-banner {
            background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%);
            padding: 80px 20px;
            text-align: center;
            color: white;
          }
          .page-banner h1 { font-size: 48px; margin-bottom: 15px; }
          .page-banner p { font-size: 20px; opacity: 0.9; }
          .container { max-width: 1200px; margin: 0 auto; padding: 60px 20px; }
          .story-section {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 60px;
            align-items: center;
            margin-bottom: 80px;
          }
          @media (max-width: 800px) { .story-section { grid-template-columns: 1fr; } }
          .story-content h2 { font-size: 36px; margin-bottom: 25px; }
          .story-content p { color: var(--text-secondary); line-height: 1.8; margin-bottom: 20px; }
          .story-image { display: flex; justify-content: center; }
          .image-placeholder {
            width: 300px;
            height: 300px;
            background: var(--card-bg);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 100px;
          }
          .values-section { margin-bottom: 80px; }
          .values-section h2 { text-align: center; font-size: 32px; margin-bottom: 40px; }
          .values-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
            gap: 30px;
          }
          .value-card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 35px;
            text-align: center;
          }
          .value-icon { font-size: 48px; margin-bottom: 20px; }
          .value-card h3 { margin-bottom: 15px; font-size: 22px; }
          .value-card p { color: var(--text-secondary); }
          .stats-section {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 30px;
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
            border-radius: 16px;
            padding: 50px;
            margin-bottom: 80px;
          }
          @media (max-width: 700px) { .stats-section { grid-template-columns: repeat(2, 1fr); } }
          .stat { text-align: center; color: white; }
          .stat-number { font-size: 42px; font-weight: 700; margin-bottom: 10px; }
          .stat-label { opacity: 0.9; }
          .team-section h2 { text-align: center; font-size: 32px; margin-bottom: 15px; }
          .team-intro { text-align: center; color: var(--text-secondary); margin-bottom: 40px; }
          .team-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 30px;
          }
          .team-member {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 30px;
            text-align: center;
          }
          .member-avatar {
            width: 80px;
            height: 80px;
            background: var(--bg-color);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 40px;
            margin: 0 auto 20px;
          }
          .team-member h4 { margin-bottom: 5px; }
          .team-member p { color: var(--text-secondary); font-size: 14px; }
        `}</style>
      </main>
      <Footer />
    </>
  );
}
