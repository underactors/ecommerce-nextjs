'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function MissionPage() {
  return (
    <>
      <Header />
      <main className="company-page">
        <div className="page-banner">
          <h1>Our Mission</h1>
          <p>Empowering people with technology that never gives up</p>
        </div>

        <div className="container">
          <section className="mission-statement">
            <div className="statement-box">
              <h2>"To provide rugged, reliable products that empower professionals and adventurers to perform their best, even in the most demanding environments."</h2>
            </div>
          </section>

          <section className="pillars-section">
            <h2>Our Mission Pillars</h2>
            <div className="pillars-grid">
              <div className="pillar">
                <div className="pillar-number">01</div>
                <h3>Uncompromising Quality</h3>
                <p>We source and test every product to ensure it meets our rigorous standards for durability and performance.</p>
              </div>
              <div className="pillar">
                <div className="pillar-number">02</div>
                <h3>Customer-First Approach</h3>
                <p>Our customers' needs drive every decision we make, from product selection to after-sales support.</p>
              </div>
              <div className="pillar">
                <div className="pillar-number">03</div>
                <h3>Sustainable Practices</h3>
                <p>We're committed to reducing our environmental impact through responsible sourcing and packaging.</p>
              </div>
              <div className="pillar">
                <div className="pillar-number">04</div>
                <h3>Continuous Innovation</h3>
                <p>We constantly seek new technologies and solutions to better serve our customers' evolving needs.</p>
              </div>
            </div>
          </section>

          <section className="vision-section">
            <h2>Our Vision</h2>
            <p>To be the global leader in rugged technology and equipment, recognized for our unwavering commitment to quality, innovation, and customer satisfaction.</p>
          </section>

          <section className="commitment-section">
            <h2>Our Commitment to You</h2>
            <div className="commitment-grid">
              <div className="commitment-item">
                <span className="check">✓</span>
                <span>Quality products that last</span>
              </div>
              <div className="commitment-item">
                <span className="check">✓</span>
                <span>Honest, transparent pricing</span>
              </div>
              <div className="commitment-item">
                <span className="check">✓</span>
                <span>Fast, reliable shipping</span>
              </div>
              <div className="commitment-item">
                <span className="check">✓</span>
                <span>Responsive customer support</span>
              </div>
              <div className="commitment-item">
                <span className="check">✓</span>
                <span>Comprehensive warranty coverage</span>
              </div>
              <div className="commitment-item">
                <span className="check">✓</span>
                <span>Easy returns and exchanges</span>
              </div>
            </div>
          </section>
        </div>

        <style jsx>{`
          .company-page { min-height: 100vh; background: var(--bg-color); }
          .page-banner {
            background: linear-gradient(135deg, #059669 0%, #047857 100%);
            padding: 80px 20px;
            text-align: center;
            color: white;
          }
          .page-banner h1 { font-size: 48px; margin-bottom: 15px; }
          .page-banner p { font-size: 20px; opacity: 0.9; }
          .container { max-width: 1000px; margin: 0 auto; padding: 60px 20px; }
          .mission-statement { margin-bottom: 80px; }
          .statement-box {
            background: var(--card-bg);
            border: 2px solid var(--accent);
            border-radius: 20px;
            padding: 60px 40px;
            text-align: center;
          }
          .statement-box h2 {
            font-size: 26px;
            font-weight: 400;
            font-style: italic;
            line-height: 1.6;
            color: var(--text-color);
          }
          .pillars-section { margin-bottom: 80px; }
          .pillars-section h2 { text-align: center; font-size: 32px; margin-bottom: 50px; }
          .pillars-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 40px;
          }
          .pillar {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 35px;
          }
          .pillar-number {
            font-size: 48px;
            font-weight: 800;
            color: var(--accent);
            opacity: 0.5;
            margin-bottom: 15px;
          }
          .pillar h3 { font-size: 20px; margin-bottom: 15px; }
          .pillar p { color: var(--text-secondary); line-height: 1.7; }
          .vision-section {
            background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%);
            border-radius: 20px;
            padding: 60px;
            text-align: center;
            color: white;
            margin-bottom: 80px;
          }
          .vision-section h2 { margin-bottom: 25px; font-size: 32px; }
          .vision-section p { font-size: 20px; line-height: 1.7; max-width: 700px; margin: 0 auto; }
          .commitment-section h2 { text-align: center; font-size: 32px; margin-bottom: 40px; }
          .commitment-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 20px;
          }
          .commitment-item {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 20px;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 10px;
          }
          .check { color: #22c55e; font-size: 22px; }
        `}</style>
      </main>
      <Footer />
    </>
  );
}
