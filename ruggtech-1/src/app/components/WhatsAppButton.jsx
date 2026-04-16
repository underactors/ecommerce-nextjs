'use client';

export default function WhatsAppButton() {
  const phoneNumber = '18683661212';
  const message = encodeURIComponent('Hi RUGGTECH! I have a question about your products.');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  return (
    <>
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="whatsapp-float"
        aria-label="Chat on WhatsApp"
      >
        <svg viewBox="0 0 32 32" className="whatsapp-icon">
          <path
            d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.128 6.744 3.046 9.378L1.054 31.29l6.118-1.958A15.908 15.908 0 0016.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.335 22.594c-.39 1.1-1.932 2.014-3.168 2.28-.846.18-1.95.324-5.67-1.218-4.762-1.974-7.826-6.81-8.064-7.126-.23-.316-1.926-2.566-1.926-4.892s1.22-3.472 1.652-3.948c.432-.476.944-.596 1.258-.596.314 0 .63.002.904.016.29.014.68-.11 1.064.812.39.94 1.33 3.246 1.446 3.482.116.236.194.51.038.826-.154.316-.232.512-.462.79-.232.276-.488.618-.696.828-.232.234-.474.488-.204.958.27.47 1.2 1.98 2.578 3.208 1.77 1.578 3.262 2.068 3.732 2.298.47.232.744.194 1.018-.116.276-.314 1.176-1.37 1.49-1.842.314-.47.628-.39 1.06-.234.432.158 2.738 1.292 3.208 1.526.47.234.784.35.9.546.116.194.116 1.138-.274 2.24z"
            fill="currentColor"
          />
        </svg>
      </a>

      <style jsx>{`
        .whatsapp-float {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 9996;
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          width: clamp(52px, 5vw, 64px);
          height: clamp(52px, 5vw, 64px);
          background: #25d366;
          border-radius: 50%;
          box-shadow: 0 4px 14px rgba(37, 211, 102, 0.45);
          color: white;
          text-decoration: none;
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          cursor: pointer;
        }
        .whatsapp-float:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(37, 211, 102, 0.55);
        }
        .whatsapp-float:active {
          transform: scale(0.95);
        }
        .whatsapp-icon {
          width: 55%;
          height: 55%;
        }
        @media (max-width: 480px) {
          .whatsapp-float {
            bottom: 16px;
            right: 16px;
          }
        }
      `}</style>
    </>
  );
}
