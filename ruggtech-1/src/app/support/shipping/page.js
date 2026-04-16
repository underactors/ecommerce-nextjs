'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function ShippingPolicyPage() {
  return (
    <>
      <Header />
      <main className="support-page">
        <div className="page-banner">
          <h1>Shipping Policy</h1>
          <p>Everything you need to know about our shipping options and delivery times</p>
        </div>

        <div className="container">
          <div className="shipping-options">
            <h2>Shipping Options</h2>
            <div className="options-grid">
              <div className="option-card">
                <div className="option-icon">📦</div>
                <h3>Standard Shipping</h3>
                <div className="price">$9.99</div>
                <p>5-7 Business Days</p>
                <span className="free-note">FREE on orders over $100</span>
              </div>
              <div className="option-card featured">
                <div className="badge">Most Popular</div>
                <div className="option-icon">🚀</div>
                <h3>Express Shipping</h3>
                <div className="price">$19.99</div>
                <p>2-3 Business Days</p>
              </div>
              <div className="option-card">
                <div className="option-icon">⚡</div>
                <h3>Overnight</h3>
                <div className="price">$39.99</div>
                <p>Next Business Day</p>
              </div>
            </div>
          </div>

          <div className="policy-section">
            <h2>Shipping Information</h2>
            
            <div className="policy-item">
              <h3>Processing Time</h3>
              <p>Orders are typically processed within 1-2 business days. Orders placed after 2:00 PM EST will be processed the next business day. During peak seasons, processing times may be extended.</p>
            </div>

            <div className="policy-item">
              <h3>Shipping Destinations</h3>
              <p>We ship to all 50 US states, US territories, and select international destinations. International shipping rates and delivery times vary by location.</p>
            </div>

            <div className="policy-item">
              <h3>Order Tracking</h3>
              <p>Once your order ships, you will receive an email with tracking information. You can also track your order by visiting the Order Status page or logging into your account.</p>
            </div>

            <div className="policy-item">
              <h3>Delivery Signature</h3>
              <p>Orders over $300 require a signature upon delivery. If you are not available, the carrier will leave a notice with pickup instructions.</p>
            </div>

            <div className="policy-item">
              <h3>Large Items & Equipment</h3>
              <p>Farming equipment and large items may require freight shipping. Delivery times and costs will be calculated at checkout. White glove delivery service is available for select items.</p>
            </div>

            <div className="policy-item">
              <h3>Shipping Restrictions</h3>
              <p>Some products may have shipping restrictions based on local regulations. Certain batteries and hazardous materials cannot be shipped via air.</p>
            </div>
          </div>

          <div className="contact-box">
            <h3>Questions about shipping?</h3>
            <p>Contact our support team for assistance with shipping inquiries.</p>
            <a href="/support/contact" className="btn">Contact Support</a>
          </div>
        </div>

        <style jsx>{`
          .support-page { min-height: 100vh; background: var(--bg-color); }
          .page-banner {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            padding: 60px 20px;
            text-align: center;
            color: white;
          }
          .page-banner h1 { font-size: 42px; margin-bottom: 15px; }
          .page-banner p { font-size: 18px; opacity: 0.9; }
          .container { max-width: 1000px; margin: 0 auto; padding: 40px 20px; }
          .shipping-options { margin-bottom: 60px; }
          .shipping-options h2 { text-align: center; margin-bottom: 30px; font-size: 28px; }
          .options-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
          }
          .option-card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            position: relative;
          }
          .option-card.featured {
            border-color: var(--accent);
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.2);
          }
          .badge {
            position: absolute;
            top: -12px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--accent);
            color: white;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
          }
          .option-icon { font-size: 48px; margin-bottom: 15px; }
          .option-card h3 { margin-bottom: 10px; }
          .price { font-size: 28px; font-weight: 700; color: var(--accent); margin-bottom: 5px; }
          .option-card p { color: var(--text-secondary); margin-bottom: 10px; }
          .free-note { color: #22c55e; font-size: 13px; font-weight: 600; }
          .policy-section h2 { font-size: 28px; margin-bottom: 30px; }
          .policy-item {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 25px;
            margin-bottom: 20px;
          }
          .policy-item h3 { margin-bottom: 10px; color: var(--accent); }
          .policy-item p { color: var(--text-secondary); line-height: 1.7; }
          .contact-box {
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
            border-radius: 16px;
            padding: 40px;
            text-align: center;
            color: white;
            margin-top: 40px;
          }
          .contact-box h3 { margin-bottom: 10px; font-size: 24px; }
          .contact-box p { margin-bottom: 20px; opacity: 0.9; }
          .btn {
            display: inline-block;
            padding: 12px 30px;
            background: white;
            color: #1e40af;
            border-radius: 8px;
            text-decoration: none;
            font-weight: 600;
          }
        `}</style>
      </main>
      <Footer />
    </>
  );
}
