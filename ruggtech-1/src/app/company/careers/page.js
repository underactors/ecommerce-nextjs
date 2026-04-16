'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default function CareersPage() {
  const openings = [
    { title: 'Customer Support Specialist', department: 'Support', location: 'Remote', type: 'Full-time' },
    { title: 'E-commerce Product Manager', department: 'Product', location: 'Remote', type: 'Full-time' },
    { title: 'Digital Marketing Specialist', department: 'Marketing', location: 'Remote', type: 'Full-time' },
    { title: 'Warehouse Operations Manager', department: 'Operations', location: 'Los Angeles, CA', type: 'Full-time' },
    { title: 'Content Writer', department: 'Marketing', location: 'Remote', type: 'Part-time' },
  ];

  return (
    <>
      <Header />
      <main className="company-page">
        <div className="page-banner">
          <h1>Careers at RUGGTECH</h1>
          <p>Join our team and help build products that last</p>
        </div>

        <div className="container">
          <section className="intro-section">
            <h2>Why Work With Us?</h2>
            <p>At RUGGTECH, we're building more than just a business—we're creating a community of passionate people who believe in quality, durability, and exceptional customer experiences.</p>
          </section>

          <section className="benefits-section">
            <h2>Benefits & Perks</h2>
            <div className="benefits-grid">
              <div className="benefit">
                <span className="benefit-icon">🏥</span>
                <h4>Health Insurance</h4>
                <p>Comprehensive medical, dental, and vision coverage</p>
              </div>
              <div className="benefit">
                <span className="benefit-icon">🏖️</span>
                <h4>Unlimited PTO</h4>
                <p>Take the time you need to recharge</p>
              </div>
              <div className="benefit">
                <span className="benefit-icon">🏠</span>
                <h4>Remote Work</h4>
                <p>Flexible work-from-home options</p>
              </div>
              <div className="benefit">
                <span className="benefit-icon">📚</span>
                <h4>Learning Budget</h4>
                <p>Annual allowance for courses and conferences</p>
              </div>
              <div className="benefit">
                <span className="benefit-icon">💰</span>
                <h4>401(k) Match</h4>
                <p>We match up to 4% of your contributions</p>
              </div>
              <div className="benefit">
                <span className="benefit-icon">📱</span>
                <h4>Product Discounts</h4>
                <p>60% off all RUGGTECH products</p>
              </div>
            </div>
          </section>

          <section className="openings-section">
            <h2>Current Openings</h2>
            <div className="openings-list">
              {openings.map((job, index) => (
                <div key={index} className="job-card">
                  <div className="job-info">
                    <h3>{job.title}</h3>
                    <div className="job-meta">
                      <span>{job.department}</span>
                      <span>{job.location}</span>
                      <span>{job.type}</span>
                    </div>
                  </div>
                  <button className="btn-apply">Apply Now</button>
                </div>
              ))}
            </div>
          </section>

          <section className="cta-section">
            <h2>Don't see the right role?</h2>
            <p>We're always looking for talented people. Send us your resume and we'll keep you in mind for future opportunities.</p>
            <a href="mailto:careers@ruggtech.com" className="btn">Send Your Resume</a>
          </section>
        </div>

        <style jsx>{`
          .company-page { min-height: 100vh; background: var(--bg-color); }
          .page-banner {
            background: linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
            padding: 80px 20px;
            text-align: center;
            color: white;
          }
          .page-banner h1 { font-size: 48px; margin-bottom: 15px; }
          .page-banner p { font-size: 20px; opacity: 0.9; }
          .container { max-width: 1000px; margin: 0 auto; padding: 60px 20px; }
          .intro-section { text-align: center; margin-bottom: 60px; }
          .intro-section h2 { font-size: 32px; margin-bottom: 20px; }
          .intro-section p { color: var(--text-secondary); font-size: 18px; max-width: 700px; margin: 0 auto; line-height: 1.7; }
          .benefits-section { margin-bottom: 60px; }
          .benefits-section h2 { text-align: center; font-size: 32px; margin-bottom: 40px; }
          .benefits-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 25px;
          }
          .benefit {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 30px;
            text-align: center;
          }
          .benefit-icon { font-size: 40px; margin-bottom: 15px; display: block; }
          .benefit h4 { margin-bottom: 10px; }
          .benefit p { color: var(--text-secondary); font-size: 14px; }
          .openings-section h2 { font-size: 32px; margin-bottom: 30px; }
          .openings-list { display: flex; flex-direction: column; gap: 15px; margin-bottom: 60px; }
          .job-card {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            padding: 25px 30px;
          }
          @media (max-width: 600px) {
            .job-card { flex-direction: column; align-items: flex-start; gap: 15px; }
          }
          .job-info h3 { margin-bottom: 8px; font-size: 18px; }
          .job-meta { display: flex; gap: 15px; flex-wrap: wrap; }
          .job-meta span {
            font-size: 13px;
            color: var(--text-secondary);
            background: var(--bg-color);
            padding: 4px 10px;
            border-radius: 4px;
          }
          .btn-apply {
            padding: 10px 25px;
            background: var(--accent);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
          }
          .cta-section {
            background: var(--card-bg);
            border: 1px solid var(--border-color);
            border-radius: 16px;
            padding: 50px;
            text-align: center;
          }
          .cta-section h2 { margin-bottom: 15px; }
          .cta-section p { color: var(--text-secondary); margin-bottom: 25px; }
          .btn {
            display: inline-block;
            padding: 12px 30px;
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
