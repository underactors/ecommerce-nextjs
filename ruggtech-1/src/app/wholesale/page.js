'use client';

import React from 'react';
import Link from 'next/link';

const BENEFITS = [
  {
    icon: '🏷️',
    title: 'Wholesale Pricing',
    description: 'Access exclusive bulk pricing on our full range of rugged devices, accessories, and Suzuki parts.',
  },
  {
    icon: '📦',
    title: 'Bulk Orders',
    description: 'Order in volume with flexible MOQs tailored to your business needs and budget.',
  },
  {
    icon: '🎧',
    title: 'Dedicated Account Manager',
    description: 'Get a dedicated point of contact to handle your account, quotes, and after-sales support.',
  },
  {
    icon: '⚡',
    title: 'Priority Fulfillment',
    description: 'Wholesale partners enjoy priority stock allocation and expedited shipping on large orders.',
  },
  {
    icon: '🛡️',
    title: 'Extended Warranty',
    description: 'Business accounts receive extended warranty terms on qualifying product categories.',
  },
  {
    icon: '🔄',
    title: 'Easy Returns & Exchanges',
    description: 'Simplified B2B returns process with dedicated support for defective or damaged stock.',
  },
];

const WHO_WE_WORK_WITH = [
  'Retailers & Distributors',
  'Construction & Mining Companies',
  'Agricultural Businesses',
  'Government & Military',
  'Logistics & Fleet Operators',
  'Outdoor & Adventure Outfitters',
  'IT Resellers & System Integrators',
  'NGOs & Non-Profits',
];

const STEPS = [
  { number: '01', title: 'Contact Us', description: "Reach out via WhatsApp or email to express your interest and tell us about your business." },
  { number: '02', title: 'Get Verified', description: 'Our team will verify your business details and set up your wholesale account.' },
  { number: '03', title: 'Request a Quote', description: "Submit your product requirements and volumes — we'll send a competitive quote within 24 hours." },
  { number: '04', title: 'Place Your Order', description: 'Confirm the order, arrange payment, and we handle the rest — from packing to delivery.' },
];

export default function WholesalePage() {
  return (
    <div style={{ backgroundColor: 'var(--bg-color)', minHeight: '100vh', color: 'var(--text-color)', fontFamily: "'Inter', sans-serif" }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary), #1d4ed8)',
        padding: '80px 20px 60px',
        textAlign: 'center',
      }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'rgba(255,255,255,0.18)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 40, margin: '0 auto 24px',
        }}>🏭</div>
        <h1 style={{ fontSize: 40, fontWeight: 800, color: '#fff', marginBottom: 12 }}>Wholesale Program</h1>
        <p style={{ fontSize: 18, color: 'rgba(255,255,255,0.85)', maxWidth: 560, margin: '0 auto 36px', lineHeight: 1.6 }}>
          Partner with RUGGTECH and grow your business with premium rugged technology
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <a
            href="https://wa.me/18683661212?text=Hi%20RUGGTECH%2C%20I'm%20interested%20in%20your%20wholesale%20program."
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#fff', color: '#25D366',
              padding: '13px 28px', borderRadius: 9999,
              fontWeight: 700, fontSize: 16, textDecoration: 'none',
              boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
            }}
          >
            <span>💬</span> WhatsApp Us
          </a>
          <a
            href="mailto:orders@ruggtech.com?subject=Wholesale%20Program%20Enquiry"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'transparent', color: '#fff',
              border: '2px solid rgba(255,255,255,0.5)',
              padding: '13px 28px', borderRadius: 9999,
              fontWeight: 700, fontSize: 16, textDecoration: 'none',
            }}
          >
            <span>✉️</span> Email Us
          </a>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 20px 80px' }}>

        {/* Intro */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '32px', marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16, color: 'var(--text-color)' }}>Built for Business</h2>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75, marginBottom: 12 }}>
            RUGGTECH's wholesale program is designed for businesses that need reliable, durable technology at scale. Whether you're equipping a workforce, stocking a retail shelf, or kitting out a fleet — we have the products and pricing to make it work.
          </p>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.75 }}>
            From rugged smartphones and tablets to Suzuki vehicle parts, off-grid solutions, and agricultural equipment, our catalog covers the full spectrum of tough-environment technology.
          </p>
        </div>

        {/* Benefits */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '32px', marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: 'var(--text-color)' }}>Partner Benefits</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {BENEFITS.map((b, i) => (
              <div key={i} style={{
                display: 'flex', gap: 14,
                background: 'var(--bg-color)',
                borderRadius: 12, padding: '18px',
                border: '1px solid var(--border-color)',
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12, flexShrink: 0,
                  background: 'rgba(59,130,246,0.12)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22,
                }}>{b.icon}</div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-color)', marginBottom: 6 }}>{b.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{b.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Who We Work With */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '32px', marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20, color: 'var(--text-color)' }}>Who We Work With</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {WHO_WE_WORK_WITH.map((item, i) => (
              <span key={i} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 9999,
                background: 'rgba(59,130,246,0.1)',
                border: '1px solid rgba(59,130,246,0.25)',
                color: 'var(--primary)', fontSize: 13, fontWeight: 500,
              }}>
                ✅ {item}
              </span>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: 16, padding: '32px', marginBottom: 24 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24, color: 'var(--text-color)' }}>How It Works</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            {STEPS.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--primary)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: 13,
                }}>{step.number}</div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-color)', marginBottom: 4 }}>{step.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)',
          borderRadius: 16, padding: '40px 32px', textAlign: 'center',
        }}>
          <div style={{ fontSize: 44, marginBottom: 16 }}>🤝</div>
          <h2 style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-color)', marginBottom: 10 }}>Ready to Partner?</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15, lineHeight: 1.7, maxWidth: 480, margin: '0 auto 28px' }}>
            Get in touch today and a member of our wholesale team will respond within one business day.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href="https://wa.me/18683661212?text=Hi%20RUGGTECH%2C%20I'm%20interested%20in%20your%20wholesale%20program."
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'var(--primary)', color: '#fff',
                padding: '14px 32px', borderRadius: 9999,
                fontWeight: 700, fontSize: 16, textDecoration: 'none',
              }}
            >
              💬 Start on WhatsApp
            </a>
            <a
              href="mailto:orders@ruggtech.com?subject=Wholesale%20Program%20Enquiry"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'transparent', color: 'var(--primary)',
                border: '2px solid var(--primary)',
                padding: '14px 32px', borderRadius: 9999,
                fontWeight: 700, fontSize: 16, textDecoration: 'none',
              }}
            >
              ✉️ Send an Email
            </a>
          </div>
        </div>

      </div>
    </div>
  );
}
