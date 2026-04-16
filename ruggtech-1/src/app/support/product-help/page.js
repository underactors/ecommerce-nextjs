'use client';

import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function ProductHelpPage() {
  const helpTopics = [
    {
      title: 'Getting Started',
      icon: '🚀',
      items: ['Unboxing your device', 'Initial setup guide', 'Transferring data', 'Basic features overview']
    },
    {
      title: 'Device Care',
      icon: '🛡️',
      items: ['Cleaning your rugged device', 'Battery maintenance', 'Waterproof care tips', 'Screen protection']
    },
    {
      title: 'Troubleshooting',
      icon: '🔧',
      items: ['Device not turning on', 'Connectivity issues', 'Battery draining fast', 'Touchscreen problems']
    },
    {
      title: 'Software Updates',
      icon: '📱',
      items: ['Checking for updates', 'Installing updates', 'Rollback options', 'Update troubleshooting']
    }
  ];

  return (
    <>
      <Header />
      <main className="support-page">
        <div className="page-banner">
          <h1>Product Help</h1>
          <p>Find answers to common questions and learn how to get the most out of your RUGGTECH products</p>
        </div>

        <div className="container">
          <div className="search-section">
            <input type="text" placeholder="Search for help topics..." className="search-input" />
            <button className="search-btn">Search</button>
          </div>

          <div className="help-grid">
            {helpTopics.map((topic, index) => (
              <div key={index} className="help-card">
                <div className="help-icon">{topic.icon}</div>
                <h3>{topic.title}</h3>
                <ul>
                  {topic.items.map((item, i) => (
                    <li key={i}><a href="#">{item}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="contact-cta">
            <h2>Still need help?</h2>
            <p>Our support team is here to assist you</p>
            <Link href="/support/contact" className="btn btn-primary">Contact Support</Link>
          </div>
        </div>

        <style jsx>{`
          .support-page {
            min-height: 100vh;
            background: var(--bg-color);
          }
          .page-banner {
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
            padding: 60px 20px;
            text-align: center;
            color: white;
          }
          .page-banner h1 {
            font-size: 42px;
            margin-bottom: 15px;
          }
          .page-banner p {
            font-size: 18px;
            opacity: 0.9;
            max-width: 600px;
            margin: 0 auto;
          }
          .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 40px 20px;
          }
          .search-section {
            display: flex;
            gap: 10px;
            max-width: 600px;
            margin: 0 auto 50px;
          }
          .search-input {
            flex: 1;
            padding: 15px 20px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            font-size: 16px;
            background: var(--card-bg);
            color: var(--text-color);
          }
          .search-btn {
            padding: 15px 30px;
            background: var(--accent);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 600;
          }
          .help-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 30px;
            margin-bottom: 60px;
          }
          .help-card {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 30px;
            transition: transform 0.3s, box-shadow 0.3s;
          }
          .help-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
          }
          .help-icon {
            font-size: 48px;
            margin-bottom: 20px;
          }
          .help-card h3 {
            font-size: 22px;
            margin-bottom: 20px;
            color: var(--text-color);
          }
          .help-card ul {
            list-style: none;
            padding: 0;
          }
          .help-card li {
            margin-bottom: 12px;
          }
          .help-card a {
            color: var(--accent);
            text-decoration: none;
          }
          .help-card a:hover {
            text-decoration: underline;
          }
          .contact-cta {
            text-align: center;
            padding: 60px;
            background: var(--card-bg);
            border-radius: 16px;
            border: 1px solid var(--border-color);
          }
          .contact-cta h2 {
            font-size: 28px;
            margin-bottom: 10px;
          }
          .contact-cta p {
            color: var(--text-secondary);
            margin-bottom: 25px;
          }
          .btn-primary {
            display: inline-block;
            padding: 15px 40px;
            background: var(--accent);
            color: white;
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
