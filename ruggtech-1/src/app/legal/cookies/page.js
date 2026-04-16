'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function CookiePolicyPage() {
  return (
    <>
      <Header />
      <main className="legal-page">
        <div className="page-banner">
          <h1>Cookie Policy</h1>
          <p>Last updated: January 1, 2026</p>
        </div>

        <div className="container">
          <div className="legal-content">
            <section>
              <h2>What Are Cookies?</h2>
              <p>Cookies are small text files that are placed on your device when you visit a website. They help websites remember your preferences and provide a better user experience.</p>
            </section>

            <section>
              <h2>How We Use Cookies</h2>
              <p>We use cookies for the following purposes:</p>
              
              <h3>Essential Cookies</h3>
              <p>These cookies are necessary for the website to function properly. They enable basic features like shopping cart functionality and secure checkout.</p>
              
              <h3>Performance Cookies</h3>
              <p>These cookies collect information about how visitors use our website, such as which pages are visited most often. This helps us improve our website.</p>
              
              <h3>Functionality Cookies</h3>
              <p>These cookies remember your preferences, like your language or region, to provide a more personalized experience.</p>
              
              <h3>Marketing Cookies</h3>
              <p>These cookies track your browsing habits to deliver relevant advertisements. They may be set by us or third-party advertising partners.</p>
            </section>

            <section>
              <h2>Third-Party Cookies</h2>
              <p>We may use third-party services that set their own cookies, including:</p>
              <ul>
                <li>Google Analytics for website analytics</li>
                <li>Facebook Pixel for advertising</li>
                <li>PayPal and Stripe for payment processing</li>
                <li>Clerk for authentication</li>
              </ul>
            </section>

            <section>
              <h2>Managing Cookies</h2>
              <p>You can control and manage cookies through your browser settings. Most browsers allow you to:</p>
              <ul>
                <li>View cookies stored on your device</li>
                <li>Delete all or specific cookies</li>
                <li>Block cookies from specific websites</li>
                <li>Block all cookies</li>
              </ul>
              <p>Please note that blocking some cookies may affect the functionality of our website.</p>
            </section>

            <section>
              <h2>Updates to This Policy</h2>
              <p>We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.</p>
            </section>

            <section>
              <h2>Contact Us</h2>
              <p>If you have questions about our use of cookies, please contact us at privacy@ruggtech.com.</p>
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
          .legal-content h3 { font-size: 18px; margin: 20px 0 10px; color: var(--accent); }
          .legal-content p { color: var(--text-secondary); line-height: 1.8; margin-bottom: 15px; }
          .legal-content ul { margin: 15px 0; padding-left: 25px; }
          .legal-content li { color: var(--text-secondary); margin-bottom: 10px; line-height: 1.6; }
        `}</style>
      </main>
      <Footer />
    </>
  );
}
