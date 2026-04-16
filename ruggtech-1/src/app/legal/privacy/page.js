'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main className="legal-page">
        <div className="page-banner">
          <h1>Privacy Policy</h1>
          <p>Last updated: January 1, 2026</p>
        </div>

        <div className="container">
          <div className="legal-content">
            <section>
              <h2>1. Information We Collect</h2>
              <p>We collect information you provide directly to us, including:</p>
              <ul>
                <li>Name, email address, phone number, and shipping address</li>
                <li>Payment information (processed securely by our payment providers)</li>
                <li>Order history and preferences</li>
                <li>Communications with our support team</li>
                <li>Account credentials when you create an account</li>
              </ul>
            </section>

            <section>
              <h2>2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul>
                <li>Process and fulfill your orders</li>
                <li>Communicate with you about orders, products, and services</li>
                <li>Provide customer support</li>
                <li>Send promotional communications (with your consent)</li>
                <li>Improve our website and services</li>
                <li>Detect and prevent fraud</li>
              </ul>
            </section>

            <section>
              <h2>3. Information Sharing</h2>
              <p>We do not sell your personal information. We may share information with:</p>
              <ul>
                <li>Service providers who assist in our operations</li>
                <li>Payment processors for transaction handling</li>
                <li>Shipping carriers to deliver your orders</li>
                <li>Law enforcement when required by law</li>
              </ul>
            </section>

            <section>
              <h2>4. Data Security</h2>
              <p>We implement appropriate security measures to protect your personal information. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.</p>
            </section>

            <section>
              <h2>5. Cookies and Tracking</h2>
              <p>We use cookies and similar technologies to enhance your experience, analyze usage, and assist with marketing. You can control cookies through your browser settings.</p>
            </section>

            <section>
              <h2>6. Your Rights</h2>
              <p>Depending on your location, you may have rights to:</p>
              <ul>
                <li>Access the personal information we hold about you</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Opt out of marketing communications</li>
                <li>Object to certain processing activities</li>
              </ul>
            </section>

            <section>
              <h2>7. Children's Privacy</h2>
              <p>Our services are not intended for children under 13. We do not knowingly collect personal information from children under 13.</p>
            </section>

            <section>
              <h2>8. Changes to This Policy</h2>
              <p>We may update this policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
            </section>

            <section>
              <h2>9. Contact Us</h2>
              <p>If you have questions about this Privacy Policy, please contact us at privacy@ruggtech.com.</p>
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
