'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function CompliancePage() {
  return (
    <>
      <Header />
      <main className="legal-page">
        <div className="page-banner">
          <h1>Compliance</h1>
          <p>Our commitment to regulatory compliance</p>
        </div>

        <div className="container">
          <div className="legal-content">
            <section>
              <h2>Overview</h2>
              <p>RUGGTECH is committed to conducting business ethically and in compliance with all applicable laws and regulations. This page outlines our compliance practices and certifications.</p>
            </section>

            <section>
              <h2>Product Safety Standards</h2>
              <p>Our products comply with relevant safety standards, including:</p>
              <ul>
                <li>FCC (Federal Communications Commission) regulations for electronic devices</li>
                <li>CE marking for products sold in the European Union</li>
                <li>RoHS (Restriction of Hazardous Substances) compliance</li>
                <li>UL certification where applicable</li>
                <li>IP (Ingress Protection) ratings certified by independent testing</li>
              </ul>
            </section>

            <section>
              <h2>Data Protection</h2>
              <p>We are committed to protecting your personal data in accordance with:</p>
              <ul>
                <li>GDPR (General Data Protection Regulation) for EU customers</li>
                <li>CCPA (California Consumer Privacy Act) for California residents</li>
                <li>PCI DSS (Payment Card Industry Data Security Standard) for payment processing</li>
              </ul>
            </section>

            <section>
              <h2>Environmental Compliance</h2>
              <p>We are committed to environmental responsibility:</p>
              <ul>
                <li>WEEE (Waste Electrical and Electronic Equipment) compliance</li>
                <li>Proper recycling programs for electronic products</li>
                <li>Sustainable packaging initiatives</li>
                <li>Carbon footprint reduction programs</li>
              </ul>
            </section>

            <section>
              <h2>Trade Compliance</h2>
              <p>RUGGTECH complies with all applicable trade laws and regulations, including:</p>
              <ul>
                <li>Export control regulations</li>
                <li>Import and customs requirements</li>
                <li>Sanctions and embargo regulations</li>
                <li>Anti-money laundering (AML) requirements</li>
              </ul>
            </section>

            <section>
              <h2>Ethical Business Practices</h2>
              <p>We maintain high ethical standards in all our business dealings:</p>
              <ul>
                <li>Anti-corruption and anti-bribery policies</li>
                <li>Fair competition practices</li>
                <li>Supplier code of conduct</li>
                <li>Transparency in marketing and advertising</li>
              </ul>
            </section>

            <section>
              <h2>Reporting Concerns</h2>
              <p>If you have concerns about compliance issues, please contact us at compliance@ruggtech.com. All reports are treated confidentially.</p>
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
