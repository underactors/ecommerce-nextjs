'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function AccessibilityPage() {
  return (
    <>
      <Header />
      <main className="legal-page">
        <div className="page-banner">
          <h1>Accessibility Statement</h1>
          <p>Our commitment to digital accessibility</p>
        </div>

        <div className="container">
          <div className="legal-content">
            <section>
              <h2>Our Commitment</h2>
              <p>RUGGTECH is committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying the relevant accessibility standards.</p>
            </section>

            <section>
              <h2>Conformance Status</h2>
              <p>We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA. These guidelines explain how to make web content more accessible for people with disabilities.</p>
            </section>

            <section>
              <h2>Accessibility Features</h2>
              <p>Our website includes the following accessibility features:</p>
              <ul>
                <li>Semantic HTML structure for screen readers</li>
                <li>Alt text for images</li>
                <li>Keyboard navigation support</li>
                <li>Sufficient color contrast</li>
                <li>Resizable text without loss of functionality</li>
                <li>Clear and consistent navigation</li>
                <li>Form labels and error messages</li>
                <li>Skip navigation links</li>
              </ul>
            </section>

            <section>
              <h2>Assistive Technologies</h2>
              <p>Our website is designed to work with various assistive technologies, including:</p>
              <ul>
                <li>Screen readers (JAWS, NVDA, VoiceOver)</li>
                <li>Screen magnifiers</li>
                <li>Speech recognition software</li>
                <li>Keyboard-only navigation</li>
              </ul>
            </section>

            <section>
              <h2>Known Limitations</h2>
              <p>While we strive for full accessibility, some content may have limitations:</p>
              <ul>
                <li>Some older product images may lack detailed alt text</li>
                <li>Some third-party content may not be fully accessible</li>
                <li>PDF documents may have limited accessibility</li>
              </ul>
              <p>We are actively working to address these issues.</p>
            </section>

            <section>
              <h2>Feedback</h2>
              <p>We welcome your feedback on the accessibility of our website. Please let us know if you encounter accessibility barriers:</p>
              <ul>
                <li>Email: accessibility@ruggtech.com</li>
                <li>Phone: 1-800-RUGGTECH</li>
              </ul>
              <p>We try to respond to accessibility feedback within 2 business days.</p>
            </section>

            <section>
              <h2>Continuous Improvement</h2>
              <p>We are continuously working to improve the accessibility of our website. This includes regular accessibility audits, staff training, and incorporating accessibility into our development process.</p>
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
