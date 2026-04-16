'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function PressPage() {
  const pressReleases = [
    { date: 'Jan 5, 2026', title: 'RUGGTECH Expands Product Line with New Farming Equipment Category' },
    { date: 'Dec 15, 2025', title: 'RUGGTECH Announces Partnership with Leading Rugged Device Manufacturer' },
    { date: 'Nov 20, 2025', title: 'RUGGTECH Reaches 10,000 Customer Milestone' },
    { date: 'Oct 1, 2025', title: 'RUGGTECH Launches New Website with Enhanced Shopping Experience' },
  ];

  return (
    <>
      <Header />
      <main className="company-page">
        <div className="page-banner">
          <h1>Press & Media</h1>
          <p>News, announcements, and media resources</p>
        </div>

        <div className="container">
          <section className="press-kit">
            <h2>Press Kit</h2>
            <p>Download our official logos, brand guidelines, and company information.</p>
            <div className="kit-downloads">
              <div className="download-item">
                <span className="icon">📦</span>
                <div>
                  <h4>Logo Package</h4>
                  <p>PNG, SVG, EPS formats</p>
                </div>
                <button className="btn-download">Download</button>
              </div>
              <div className="download-item">
                <span className="icon">📄</span>
                <div>
                  <h4>Brand Guidelines</h4>
                  <p>Colors, typography, usage</p>
                </div>
                <button className="btn-download">Download</button>
              </div>
              <div className="download-item">
                <span className="icon">📊</span>
                <div>
                  <h4>Fact Sheet</h4>
                  <p>Company overview & stats</p>
                </div>
                <button className="btn-download">Download</button>
              </div>
            </div>
          </section>

          <section className="releases-section">
            <h2>Press Releases</h2>
            <div className="releases-list">
              {pressReleases.map((release, index) => (
                <div key={index} className="release-item">
                  <span className="release-date">{release.date}</span>
                  <h3>{release.title}</h3>
                  <a href="#" className="read-more">Read More →</a>
                </div>
              ))}
            </div>
          </section>

          <section className="contact-section">
            <h2>Media Contact</h2>
            <div className="contact-card">
              <p>For press inquiries, please contact:</p>
              <div className="contact-info">
                <p><strong>Email:</strong> press@ruggtech.com</p>
                <p><strong>Phone:</strong> 1-800-RUGGTECH ext. 200</p>
              </div>
              <p className="response-time">We typically respond within 24-48 hours.</p>
            </div>
          </section>
        </div>

        <style jsx>{`
          .company-page { min-height: 100vh; background: var(--bg-color); }
          .page-banner {
            background: linear-gradient(135deg, #64748b 0%, #475569 100%);
            padding: 80px 20px;
            text-align: center;
            color: white;
          }
          .page-banner h1 { font-size: 48px; margin-bottom: 15px; }
          .page-banner p { font-size: 20px; opacity: 0.9; }
          .container { max-width: 1000px; margin: 0 auto; padding: 60px 20px; }
          .press-kit { margin-bottom: 60px; }
          .press-kit h2 { font-size: 28px; margin-bottom: 10px; }
          .press-kit > p { color: var(--text-secondary); margin-bottom: 30px; }
          .kit-downloads { display: flex; flex-direction: column; gap: 15px; }
          .download-item {
            display: flex;
            align-items: center;
            gap: 20px;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 20px 25px;
          }
          .download-item .icon { font-size: 32px; }
          .download-item div { flex: 1; }
          .download-item h4 { margin-bottom: 5px; }
          .download-item p { font-size: 13px; color: var(--text-secondary); }
          .btn-download {
            padding: 8px 20px;
            background: var(--accent);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
          }
          .releases-section { margin-bottom: 60px; }
          .releases-section h2 { font-size: 28px; margin-bottom: 25px; }
          .releases-list { display: flex; flex-direction: column; gap: 20px; }
          .release-item {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 25px;
          }
          .release-date { font-size: 13px; color: var(--text-secondary); display: block; margin-bottom: 8px; }
          .release-item h3 { font-size: 18px; margin-bottom: 12px; }
          .read-more { color: var(--accent); text-decoration: none; font-size: 14px; }
          .contact-section h2 { font-size: 28px; margin-bottom: 20px; }
          .contact-card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 40px;
          }
          .contact-info { margin: 20px 0; }
          .contact-info p { margin-bottom: 10px; }
          .response-time { font-size: 14px; color: var(--text-secondary); }
        `}</style>
      </main>
      <Footer />
    </>
  );
}
