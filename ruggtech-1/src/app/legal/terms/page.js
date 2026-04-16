'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function TermsOfServicePage() {
  return (
    <>
      <Header />
      <main className="legal-page">
        <div className="page-banner">
          <h1>Terms of Service</h1>
          <p>Last updated: January 1, 2026</p>
        </div>

        <div className="container">
          <div className="legal-content">
            <section>
              <h2>1. Acceptance of Terms</h2>
              <p>By accessing and using the RUGGTECH website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this service.</p>
            </section>

            <section>
              <h2>2. Use of Service</h2>
              <p>You agree to use our services only for purposes that are legal, proper, and in accordance with these Terms. You are responsible for all activity on your account.</p>
              <ul>
                <li>You must be at least 18 years old to make purchases</li>
                <li>You must provide accurate and complete information</li>
                <li>You are responsible for maintaining the security of your account</li>
                <li>You may not use the service for any illegal purposes</li>
              </ul>
            </section>

            <section>
              <h2>3. Products and Pricing</h2>
              <p>All products and pricing are subject to change without notice. We reserve the right to modify or discontinue products at any time. Prices are displayed in USD unless otherwise noted.</p>
            </section>

            <section>
              <h2>4. Orders and Payments</h2>
              <p>By placing an order, you are making an offer to purchase. We reserve the right to accept or decline your order. Payment must be received before orders are processed.</p>
            </section>

            <section>
              <h2>5. Shipping and Delivery</h2>
              <p>Shipping times are estimates and are not guaranteed. We are not responsible for delays caused by shipping carriers, customs, or other factors beyond our control.</p>
            </section>

            <section>
              <h2>6. Returns and Refunds</h2>
              <p>Our return policy allows returns within 30 days of delivery for most products. Items must be unused and in original packaging. Some items may be subject to restocking fees.</p>
            </section>

            <section>
              <h2>7. Warranty</h2>
              <p>Product warranties vary by manufacturer and product category. Please refer to our Warranty page for specific coverage details.</p>
            </section>

            <section>
              <h2>8. Limitation of Liability</h2>
              <p>RUGGTECH shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of our services or products.</p>
            </section>

            <section>
              <h2>9. Intellectual Property</h2>
              <p>All content on this website, including text, graphics, logos, and images, is the property of RUGGTECH or its content suppliers and is protected by intellectual property laws.</p>
            </section>

            <section>
              <h2>10. Changes to Terms</h2>
              <p>We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of the service constitutes acceptance of the modified terms.</p>
            </section>

            <section>
              <h2>11. Contact Information</h2>
              <p>If you have questions about these Terms of Service, please contact us at legal@ruggtech.com.</p>
            </section>
          </div>
        </div>

        <style jsx>{`
          .legal-page { min-height: 100vh; background: var(--bg-color); }
          .page-banner {
            background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
            padding: 60px 20px;
            text-align: center;
            color: white;
          }
          .page-banner h1 { font-size: 42px; margin-bottom: 10px; }
          .page-banner p { opacity: 0.8; }
          .container { max-width: 900px; margin: 0 auto; padding: 50px 20px; }
          .legal-content section { margin-bottom: 40px; }
          .legal-content h2 { font-size: 22px; margin-bottom: 15px; color: var(--text-color); }
          .legal-content p { color: var(--text-secondary); line-height: 1.8; margin-bottom: 15px; }
          .legal-content ul { margin: 15px 0; padding-left: 25px; }
          .legal-content li { color: var(--text-secondary); margin-bottom: 10px; line-height: 1.6; }
        `}</style>
      </main>
      <Footer />
    </>
  );
}
