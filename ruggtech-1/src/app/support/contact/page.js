'use client';

import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function ContactSupportPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    orderId: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Thank you for contacting us! We will respond within 24-48 hours.');
  };

  return (
    <>
      <Header />
      <main className="support-page">
        <div className="page-banner">
          <h1>Contact Support</h1>
          <p>We're here to help. Reach out to us and we'll respond as soon as we can.</p>
        </div>

        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <h2>Get in Touch</h2>
              
              <div className="info-card">
                <div className="info-icon">📧</div>
                <div>
                  <h4>Email</h4>
                  <p>support@ruggtech.com</p>
                  <span>Response within 24 hours</span>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">📞</div>
                <div>
                  <h4>Phone</h4>
                  <p>1-800-RUGGTECH</p>
                  <span>Mon-Fri: 9AM-6PM EST</span>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">💬</div>
                <div>
                  <h4>Live Chat</h4>
                  <p>Available on website</p>
                  <span>Mon-Sat: 8AM-10PM EST</span>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">📍</div>
                <div>
                  <h4>Headquarters</h4>
                  <p>RUGGTECH Inc.</p>
                  <span>United States</span>
                </div>
              </div>
            </div>

            <div className="contact-form-container">
              <h2>Send us a Message</h2>
              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Your Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Subject *</label>
                    <select
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      required
                    >
                      <option value="">Select a topic</option>
                      <option value="order">Order Issue</option>
                      <option value="product">Product Question</option>
                      <option value="warranty">Warranty Claim</option>
                      <option value="return">Return/Exchange</option>
                      <option value="technical">Technical Support</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Order ID (if applicable)</label>
                    <input
                      type="text"
                      value={formData.orderId}
                      onChange={(e) => setFormData({...formData, orderId: e.target.value})}
                      placeholder="RUG-XXXXX"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Message *</label>
                  <textarea
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    required
                    placeholder="Please describe your issue or question in detail..."
                  ></textarea>
                </div>

                <button type="submit" className="btn-submit">Send Message</button>
              </form>
            </div>
          </div>
        </div>

        <style jsx>{`
          .support-page { min-height: 100vh; background: var(--bg-color); }
          .page-banner {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            padding: 60px 20px;
            text-align: center;
            color: white;
          }
          .page-banner h1 { font-size: 42px; margin-bottom: 15px; }
          .page-banner p { font-size: 18px; opacity: 0.9; }
          .container { max-width: 1200px; margin: 0 auto; padding: 40px 20px; }
          .contact-grid {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 40px;
          }
          @media (max-width: 900px) {
            .contact-grid { grid-template-columns: 1fr; }
          }
          .contact-info h2, .contact-form-container h2 { margin-bottom: 30px; font-size: 24px; }
          .info-card {
            display: flex;
            gap: 20px;
            padding: 20px;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            margin-bottom: 15px;
          }
          .info-icon { font-size: 32px; }
          .info-card h4 { margin-bottom: 5px; }
          .info-card p { color: var(--text-color); }
          .info-card span { font-size: 13px; color: var(--text-secondary); }
          .contact-form-container {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 40px;
          }
          .contact-form { display: flex; flex-direction: column; gap: 20px; }
          .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
          @media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } }
          .form-group label { display: block; margin-bottom: 8px; font-weight: 500; }
          .form-group input, .form-group select, .form-group textarea {
            width: 100%;
            padding: 12px 15px;
            border: 1px solid var(--border-color);
            border-radius: 8px;
            font-size: 15px;
            background: var(--bg-color);
            color: var(--text-color);
          }
          .form-group textarea { resize: vertical; }
          .btn-submit {
            padding: 15px 40px;
            background: var(--accent);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            align-self: flex-start;
          }
          .btn-submit:hover { opacity: 0.9; }
        `}</style>
      </main>
      <Footer />
    </>
  );
}
