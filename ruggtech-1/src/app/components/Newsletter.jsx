import { useState } from 'react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(''); // 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setStatus('error');
      setMessage('Please enter your email address.');
      return;
    }

    setStatus('loading');
    
    try {
      // This is where you'd integrate with your email service
      // For example, with Mailchimp, ConvertKit, or your own API
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: email,
          source: 'website_newsletter'
        }),
      });

      if (response.ok) {
        setStatus('success');
        setMessage('Successfully subscribed! Welcome to RUGGTECH updates.');
        setEmail(''); // Clear the form
      } else {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
    }
  };

  return (
    <section className="newsletter">
      <h2>Stay Updated with RUGGTECH</h2>
      <p>Subscribe to our newsletter for the latest rugged devices, Suzuki parts, and exclusive deals</p>
      
      <div className="newsletter-form">
        <input 
          type="email" 
          placeholder="Your email address" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
          disabled={status === 'loading'}
        />
        
        <button 
          type="submit" 
          onClick={handleSubmit}
          disabled={status === 'loading'}
        >
          {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
        </button>
      </div>

      {message && (
        <div className={status === 'success' ? 'success-message' : 'error-message'}>
          {message}
        </div>
      )}
    </section>
  );
}