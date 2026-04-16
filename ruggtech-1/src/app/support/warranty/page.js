'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function WarrantyPage() {
  return (
    <>
      <Header />
      <main className="support-page">
        <div className="page-banner">
          <h1>Warranty Information</h1>
          <p>Learn about our comprehensive warranty coverage for all RUGGTECH products</p>
        </div>

        <div className="container">
          <div className="warranty-hero">
            <div className="warranty-badge">🛡️</div>
            <h2>Industry-Leading Protection</h2>
            <p>All RUGGTECH products come with comprehensive warranty coverage designed to give you peace of mind.</p>
          </div>

          <div className="warranty-cards">
            <div className="warranty-card">
              <h3>📱 Rugged Devices</h3>
              <div className="warranty-period">2 Years</div>
              <ul>
                <li>Manufacturing defects</li>
                <li>Hardware malfunctions</li>
                <li>Battery issues (1 year)</li>
                <li>Screen defects</li>
              </ul>
            </div>

            <div className="warranty-card">
              <h3>🚗 Suzuki Parts</h3>
              <div className="warranty-period">1 Year</div>
              <ul>
                <li>Manufacturing defects</li>
                <li>Material quality issues</li>
                <li>Fitment guarantee</li>
                <li>Performance standards</li>
              </ul>
            </div>

            <div className="warranty-card">
              <h3>🚜 Farming Equipment</h3>
              <div className="warranty-period">3 Years</div>
              <ul>
                <li>Mechanical failures</li>
                <li>Structural integrity</li>
                <li>Electronic components</li>
                <li>Wear-resistant parts</li>
              </ul>
            </div>
          </div>

          <div className="warranty-section">
            <h2>What's Covered</h2>
            <div className="coverage-grid">
              <div className="coverage-item covered">
                <span className="icon">✓</span>
                <span>Manufacturing defects</span>
              </div>
              <div className="coverage-item covered">
                <span className="icon">✓</span>
                <span>Hardware malfunctions</span>
              </div>
              <div className="coverage-item covered">
                <span className="icon">✓</span>
                <span>Component failures</span>
              </div>
              <div className="coverage-item covered">
                <span className="icon">✓</span>
                <span>Quality issues</span>
              </div>
              <div className="coverage-item not-covered">
                <span className="icon">✗</span>
                <span>Physical damage from misuse</span>
              </div>
              <div className="coverage-item not-covered">
                <span className="icon">✗</span>
                <span>Water damage beyond IP rating</span>
              </div>
              <div className="coverage-item not-covered">
                <span className="icon">✗</span>
                <span>Unauthorized modifications</span>
              </div>
              <div className="coverage-item not-covered">
                <span className="icon">✗</span>
                <span>Normal wear and tear</span>
              </div>
            </div>
          </div>

          <div className="claim-section">
            <h2>How to Make a Warranty Claim</h2>
            <div className="steps">
              <div className="step">
                <div className="step-number">1</div>
                <h4>Gather Information</h4>
                <p>Have your order number, product serial number, and proof of purchase ready.</p>
              </div>
              <div className="step">
                <div className="step-number">2</div>
                <h4>Contact Support</h4>
                <p>Reach out to our support team via email or phone to initiate your claim.</p>
              </div>
              <div className="step">
                <div className="step-number">3</div>
                <h4>Ship Product</h4>
                <p>If required, ship the product to our service center using the prepaid label provided.</p>
              </div>
              <div className="step">
                <div className="step-number">4</div>
                <h4>Resolution</h4>
                <p>We'll repair or replace your product and ship it back within 5-10 business days.</p>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .support-page { min-height: 100vh; background: var(--bg-color); }
          .page-banner {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 60px 20px;
            text-align: center;
            color: white;
          }
          .page-banner h1 { font-size: 42px; margin-bottom: 15px; }
          .page-banner p { font-size: 18px; opacity: 0.9; }
          .container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
          .warranty-hero {
            text-align: center;
            padding: 50px;
            background: var(--card-bg);
            border-radius: 16px;
            margin-bottom: 50px;
            border: 1px solid var(--border-color);
          }
          .warranty-badge { font-size: 64px; margin-bottom: 20px; }
          .warranty-hero h2 { font-size: 32px; margin-bottom: 15px; }
          .warranty-hero p { color: var(--text-secondary); max-width: 600px; margin: 0 auto; }
          .warranty-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 30px;
            margin-bottom: 60px;
          }
          .warranty-card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 30px;
            text-align: center;
          }
          .warranty-card h3 { font-size: 20px; margin-bottom: 15px; }
          .warranty-period {
            font-size: 36px;
            font-weight: 700;
            color: var(--accent);
            margin-bottom: 20px;
          }
          .warranty-card ul { list-style: none; padding: 0; text-align: left; }
          .warranty-card li { padding: 8px 0; border-bottom: 1px solid var(--border-color); }
          .warranty-section { margin-bottom: 60px; }
          .warranty-section h2 { font-size: 28px; margin-bottom: 30px; text-align: center; }
          .coverage-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
          }
          .coverage-item {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px 20px;
            background: var(--card-bg);
            border-radius: 8px;
            border: 1px solid var(--border-color);
          }
          .coverage-item.covered .icon { color: #22c55e; font-size: 20px; }
          .coverage-item.not-covered .icon { color: #ef4444; font-size: 20px; }
          .claim-section { background: var(--card-bg); border-radius: 16px; padding: 50px; border: 1px solid var(--border-color); }
          .claim-section h2 { text-align: center; margin-bottom: 40px; }
          .steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 30px; }
          .step { text-align: center; }
          .step-number {
            width: 50px;
            height: 50px;
            background: var(--accent);
            color: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: 700;
            margin: 0 auto 15px;
          }
          .step h4 { margin-bottom: 10px; }
          .step p { color: var(--text-secondary); font-size: 14px; }
        `}</style>
      </main>
      <Footer />
    </>
  );
}
