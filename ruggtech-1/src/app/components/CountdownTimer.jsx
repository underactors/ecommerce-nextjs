'use client';

import { useState, useEffect } from 'react';

export default function CountdownTimer({ endDate, label = "Deal ends in:" }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(endDate).getTime();
      const difference = end - now;

      if (difference <= 0) {
        setIsExpired(true);
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [endDate]);

  if (isExpired) {
    return (
      <div className="countdown-expired">
        <span>This deal has ended</span>
        <style jsx>{`
          .countdown-expired {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.3);
            padding: 10px 20px;
            border-radius: 8px;
            color: #ef4444;
            font-weight: 600;
            text-align: center;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="countdown-container">
      <span className="countdown-label">{label}</span>
      <div className="countdown-timer">
        <div className="time-unit">
          <span className="time-value">{String(timeLeft.days).padStart(2, '0')}</span>
          <span className="time-label">Days</span>
        </div>
        <span className="separator">:</span>
        <div className="time-unit">
          <span className="time-value">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="time-label">Hours</span>
        </div>
        <span className="separator">:</span>
        <div className="time-unit">
          <span className="time-value">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="time-label">Mins</span>
        </div>
        <span className="separator">:</span>
        <div className="time-unit">
          <span className="time-value">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="time-label">Secs</span>
        </div>
      </div>

      <style jsx>{`
        .countdown-container {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          padding: 15px 25px;
          border-radius: 12px;
          display: inline-flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
        }
        .countdown-label {
          color: rgba(255, 255, 255, 0.9);
          font-size: 13px;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .countdown-timer {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .time-unit {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 50px;
        }
        .time-value {
          font-size: 28px;
          font-weight: 700;
          color: white;
          line-height: 1;
          font-family: monospace;
        }
        .time-label {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.8);
          text-transform: uppercase;
          margin-top: 4px;
        }
        .separator {
          font-size: 24px;
          font-weight: 700;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 15px;
        }
        @media (max-width: 480px) {
          .countdown-container {
            padding: 12px 15px;
          }
          .time-value {
            font-size: 22px;
          }
          .time-unit {
            min-width: 40px;
          }
        }
      `}</style>
    </div>
  );
}
