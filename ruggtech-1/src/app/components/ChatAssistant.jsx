'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';

// ── Constants ──────────────────────────────────────────────────────────────────

const WELCOME = "Hi! I'm your RUGGTECH assistant. Ask me anything about our products, orders, shipping, or support.";

const QUICK_REPLIES = [
  'Track my order',
  'Product recommendations',
  'Care & warranty',
  'Return policy',
];

const INQUIRY_TYPE_LABELS = {
  part_not_found: 'Part / Product Not Found',
  price_quote: 'Price / Bulk Quote',
  custom_order: 'Custom Order',
  support_ticket: 'Support Ticket',
};

const INQUIRY_MARKER_RE = /\[INQUIRY:(part_not_found|price_quote|custom_order|support_ticket)\]/;
const COMPLETE_MARKER_RE = /\[INQUIRY_COMPLETE\]\s*(\{[\s\S]*?\})/;

function stripMarkers(text) {
  return text
    .replace(INQUIRY_MARKER_RE, '')
    .replace(/\[INQUIRY_COMPLETE\][\s\S]*/, '')
    .trim();
}

function parseInquiryDraft(text) {
  const match = text.match(COMPLETE_MARKER_RE);
  if (!match) return null;
  try { return JSON.parse(match[1]); } catch { return null; }
}

function formatTime(d) {
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ── TypingIndicator ────────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <span className="rg-typing">
      <span /><span /><span />
    </span>
  );
}

// ── ConfirmRow ─────────────────────────────────────────────────────────────────

function ConfirmRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 8, padding: '3px 0' }}>
      <span style={{ color: 'var(--text-secondary)', fontSize: 13, width: 90, flexShrink: 0 }}>{label}</span>
      <span style={{ color: 'var(--text-color)', fontSize: 13, fontWeight: 500, flex: 1 }}>{value}</span>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ChatAssistant() {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: '0', role: 'assistant', content: WELCOME, timestamp: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const [pendingImage, setPendingImage] = useState(null); // { dataUrl, file }

  // gate = guest contact form | idle = normal | collecting = gathering info | confirm | saving | saved
  const [chatMode, setChatMode] = useState('gate');
  const [inquiryType, setInquiryType] = useState(null);
  const [inquiryDraft, setInquiryDraft] = useState(null);
  const [savedRequestId, setSavedRequestId] = useState(null);
  const [whatsappLink, setWhatsappLink] = useState(null);

  const [guestContact, setGuestContact] = useState({
    name: '', email: '', whatsapp: '', preferredContact: 'email',
  });
  const [gateError, setGateError] = useState('');

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Once Clerk loads: signed-in users skip gate
  useEffect(() => {
    if (!isLoaded) return;
    if (userId) setChatMode('idle');
  }, [isLoaded, userId]);

  // Pre-fill from Clerk
  useEffect(() => {
    if (userId && user) {
      const name = [user.firstName, user.lastName].filter(Boolean).join(' ');
      const email = user.primaryEmailAddress?.emailAddress || '';
      setGuestContact(prev => ({ ...prev, name, email }));
    }
  }, [userId, user]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, chatMode]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + 'px';
    }
  }, [input]);

  // ── Guest gate submit ──────────────────────────────────────────────────────

  const handleGateSubmit = useCallback((e) => {
    e.preventDefault();
    if (!guestContact.name.trim()) { setGateError('Please enter your name.'); return; }
    const hasContact =
      (guestContact.preferredContact === 'email' && guestContact.email.trim()) ||
      (guestContact.preferredContact === 'whatsapp' && guestContact.whatsapp.trim());
    if (!hasContact) {
      setGateError(guestContact.preferredContact === 'email'
        ? 'Please enter your email address.'
        : 'Please enter your WhatsApp number.');
      return;
    }
    setGateError('');
    setChatMode('idle');
  }, [guestContact]);

  // ── Image attachment ───────────────────────────────────────────────────────

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPendingImage({ dataUrl: ev.target.result, file });
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // ── Send message ───────────────────────────────────────────────────────────

  const handleSend = useCallback(async (text) => {
    const content = (text ?? input).trim();
    const hasImage = !!pendingImage;
    if ((!content && !hasImage) || loading || chatMode === 'gate') return;

    setInput('');
    setShowQuickReplies(false);
    const imgData = pendingImage;
    setPendingImage(null);

    const userMsg = {
      id: Date.now().toString(),
      role: 'user',
      content: content || (hasImage ? '[Image attached]' : ''),
      timestamp: new Date(),
      imageUrl: imgData?.dataUrl ?? undefined,
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages
        .filter(m => m.id !== '0')
        .map(m => ({ role: m.role, content: m.content }));

      const messageText = content + (hasImage ? '\n[Customer has attached an image of the item they need]' : '');
      const messageToSend = chatMode === 'collecting' ? `[COLLECT] ${messageText}` : messageText;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...history, { role: 'user', content: messageToSend }],
        }),
      });
      const data = await res.json();
      const reply = data.content || "Sorry, I couldn't get a response. Please try again.";

      // Check INQUIRY_COMPLETE
      const draft = parseInquiryDraft(reply);
      if (draft) {
        setInquiryDraft(draft);
        setChatMode('confirm');
        const clean = stripMarkers(reply);
        if (clean) setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: clean, timestamp: new Date() }]);
        return;
      }

      // Check inquiry trigger
      const markerMatch = reply.match(INQUIRY_MARKER_RE);
      if (markerMatch) {
        setInquiryType(markerMatch[1]);
        setChatMode('collecting');
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: stripMarkers(reply), timestamp: new Date() }]);
        return;
      }

      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: reply, timestamp: new Date() }]);
    } finally {
      setLoading(false);
    }
  }, [input, pendingImage, loading, messages, chatMode]);

  // ── Submit inquiry ─────────────────────────────────────────────────────────

  const handleSubmitInquiry = useCallback(async () => {
    if (!inquiryDraft || !inquiryType) return;
    setChatMode('saving');

    const contact = userId && user
      ? {
          customerName: [user.firstName, user.lastName].filter(Boolean).join(' '),
          customerEmail: user.primaryEmailAddress?.emailAddress || '',
          customerWhatsapp: guestContact.whatsapp,
          customerId: userId,
          preferredContact: guestContact.preferredContact || 'email',
        }
      : {
          customerName: guestContact.name,
          customerEmail: guestContact.email,
          customerWhatsapp: guestContact.whatsapp,
          preferredContact: guestContact.preferredContact,
        };

    try {
      const res = await fetch('/api/parts-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inquiryType, ...inquiryDraft, ...contact }),
      });
      const json = await res.json();

      if (res.ok && json.requestId) {
        setSavedRequestId(json.requestId);
        setWhatsappLink(json.whatsappAdminLink || null);
        setChatMode('saved');
        setMessages(prev => [...prev, {
          id: Date.now().toString(), role: 'assistant',
          content: 'Your request has been submitted! Our team will review it and get back to you shortly.',
          timestamp: new Date(),
        }]);
      } else {
        setChatMode('confirm');
        setMessages(prev => [...prev, {
          id: Date.now().toString(), role: 'assistant',
          content: `Sorry, I couldn't submit that: ${json?.error || 'Unknown error'}. Please try again.`,
          timestamp: new Date(),
        }]);
      }
    } catch {
      setChatMode('confirm');
      setMessages(prev => [...prev, {
        id: Date.now().toString(), role: 'assistant',
        content: 'Network error. Please check your connection and try again.',
        timestamp: new Date(),
      }]);
    }
  }, [inquiryDraft, inquiryType, userId, user, guestContact]);

  const handleEditInquiry = useCallback(() => {
    setChatMode('collecting');
    const editMsg = "I'd like to change something in my request.";
    setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: editMsg, timestamp: new Date() }]);
    handleSend(editMsg);
  }, [handleSend]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Floating button — only visible when chat is closed */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Open AI Assistant"
          style={{
            position: 'fixed',
            bottom: 100,
            right: 24,
            zIndex: 9998,
            width: 56,
            height: 56,
            borderRadius: '50%',
            background: '#3b82f6',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(59,130,246,0.5)',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(59,130,246,0.6)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(59,130,246,0.5)'; }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            <circle cx="9" cy="10" r="0.5" fill="#fff"/>
            <circle cx="12" cy="10" r="0.5" fill="#fff"/>
            <circle cx="15" cy="10" r="0.5" fill="#fff"/>
          </svg>
        </button>
      )}

      {/* Chat modal */}
      {open && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 9997,
          width: 'min(420px, calc(100vw - 32px))',
          height: 'min(620px, calc(100vh - 48px))',
          background: 'var(--card-bg)',
          borderRadius: 20,
          border: '1px solid var(--border-color)',
          boxShadow: '0 24px 60px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          fontFamily: "'Inter', sans-serif",
        }}>

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '14px 16px', borderBottom: '1px solid var(--border-color)',
            background: 'var(--card-bg)', flexShrink: 0,
          }}>
            <div style={{
              width: 40, height: 40, borderRadius: '50%',
              background: '#3b82f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
                <path d="M8 21h8m-4-4v4"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-color)', letterSpacing: 0.2 }}>RUGGTECH Assistant</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 2 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Powered by AI · Usually replies instantly</span>
              </div>
            </div>
            {chatMode === 'collecting' && (
              <span style={{
                fontSize: 11, fontWeight: 600, color: '#3b82f6',
                background: 'rgba(59,130,246,0.12)', border: '1px solid rgba(59,130,246,0.3)',
                borderRadius: 9999, padding: '3px 10px',
              }}>Collecting info</span>
            )}
            <button
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              style={{
                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(255,255,255,0.08)', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-secondary)', marginLeft: 4,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* Body */}
          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

            {/* ── GATE ── */}
            {chatMode === 'gate' && (
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {!isLoaded ? (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-secondary)' }}>
                    <div className="rg-spinner" />
                  </div>
                ) : (
                  <>
                    <div style={{
                      background: 'var(--bg-color)', border: '1px solid var(--border-color)',
                      borderRadius: 14, padding: 20, textAlign: 'center',
                    }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: '50%',
                        background: 'rgba(59,130,246,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 12px', fontSize: 24,
                      }}>👋</div>
                      <div style={{ fontWeight: 700, fontSize: 17, color: 'var(--text-color)', marginBottom: 6 }}>Before we start...</div>
                      <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>Tell us who you are so we can follow up if needed.</div>
                    </div>

                    {gateError && (
                      <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 8, padding: '10px 14px', color: '#ef4444', fontSize: 13 }}>
                        {gateError}
                      </div>
                    )}

                    <form onSubmit={handleGateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-color)', display: 'block', marginBottom: 6 }}>Your Name</label>
                        <input
                          type="text" placeholder="John Smith"
                          value={guestContact.name}
                          onChange={e => setGuestContact(p => ({ ...p, name: e.target.value }))}
                          style={inputStyle}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-color)', display: 'block', marginBottom: 8 }}>How should we reach you?</label>
                        <div style={{ display: 'flex', gap: 8 }}>
                          {['email', 'whatsapp'].map(opt => (
                            <button
                              key={opt} type="button"
                              onClick={() => setGuestContact(p => ({ ...p, preferredContact: opt }))}
                              style={{
                                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                                padding: '10px', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600,
                                border: `1px solid ${guestContact.preferredContact === opt ? '#3b82f6' : 'var(--border-color)'}`,
                                background: guestContact.preferredContact === opt ? 'rgba(59,130,246,0.12)' : 'var(--bg-color)',
                                color: guestContact.preferredContact === opt ? '#3b82f6' : 'var(--text-secondary)',
                              }}
                            >
                              {opt === 'email' ? '✉️' : '💬'} {opt === 'email' ? 'Email' : 'WhatsApp'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {guestContact.preferredContact === 'email' && (
                        <div>
                          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-color)', display: 'block', marginBottom: 6 }}>Email Address</label>
                          <input
                            type="email" placeholder="john@example.com"
                            value={guestContact.email}
                            onChange={e => setGuestContact(p => ({ ...p, email: e.target.value }))}
                            style={inputStyle}
                          />
                        </div>
                      )}

                      {guestContact.preferredContact === 'whatsapp' && (
                        <div>
                          <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-color)', display: 'block', marginBottom: 6 }}>WhatsApp Number</label>
                          <input
                            type="tel" placeholder="18683001234 (with country code)"
                            value={guestContact.whatsapp}
                            onChange={e => setGuestContact(p => ({ ...p, whatsapp: e.target.value }))}
                            style={inputStyle}
                          />
                        </div>
                      )}

                      <button type="submit" style={{
                        width: '100%', padding: '13px', borderRadius: 12,
                        background: '#3b82f6', color: '#fff', fontWeight: 700,
                        fontSize: 15, border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      }}>
                        Start Chatting →
                      </button>
                    </form>
                  </>
                )}
              </div>
            )}

            {/* ── CHAT ── */}
            {chatMode !== 'gate' && (
              <div style={{ padding: '12px 12px 8px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {messages.map(msg => {
                  const isUser = msg.role === 'user';
                  return (
                    <div key={msg.id} style={{
                      display: 'flex', alignItems: 'flex-end', gap: 8,
                      justifyContent: isUser ? 'flex-end' : 'flex-start',
                    }}>
                      {!isUser && (
                        <div style={{
                          width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                          background: 'rgba(59,130,246,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          marginBottom: 18, fontSize: 12,
                        }}>🤖</div>
                      )}
                      <div style={{ maxWidth: '78%' }}>
                        <div style={{
                          padding: '10px 14px', borderRadius: 18,
                          ...(isUser
                            ? { background: '#3b82f6', color: '#fff', borderTopRightRadius: 4 }
                            : { background: 'var(--bg-color)', border: '1px solid var(--border-color)', color: 'var(--text-color)', borderTopLeftRadius: 4 }
                          ),
                        }}>
                          {msg.imageUrl && (
                            <img src={msg.imageUrl} alt="attachment" style={{ width: '100%', maxWidth: 200, height: 140, objectFit: 'cover', borderRadius: 8, marginBottom: 6, display: 'block' }} />
                          )}
                          {msg.content && (
                            <span style={{ fontSize: 14, lineHeight: 1.55, whiteSpace: 'pre-wrap' }}>{msg.content}</span>
                          )}
                        </div>
                        <div style={{ fontSize: 10, marginTop: 3, opacity: 0.6, color: 'var(--text-secondary)', textAlign: isUser ? 'right' : 'left', padding: '0 4px' }}>
                          {formatTime(msg.timestamp instanceof Date ? msg.timestamp : new Date(msg.timestamp))}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Typing indicator */}
                {loading && (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
                    <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>🤖</div>
                    <div style={{ background: 'var(--bg-color)', border: '1px solid var(--border-color)', borderRadius: 18, borderTopLeftRadius: 4, padding: '12px 14px' }}>
                      <TypingIndicator />
                    </div>
                  </div>
                )}

                {/* Quick replies */}
                {showQuickReplies && !loading && chatMode === 'idle' && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4, paddingLeft: 34 }}>
                    {QUICK_REPLIES.map(qr => (
                      <button
                        key={qr}
                        onClick={() => handleSend(qr)}
                        style={{
                          padding: '6px 13px', borderRadius: 9999, cursor: 'pointer',
                          border: '1px solid #3b82f6', background: 'rgba(59,130,246,0.1)',
                          color: '#3b82f6', fontSize: 12, fontWeight: 500,
                        }}
                      >{qr}</button>
                    ))}
                  </div>
                )}

                {/* Confirm card */}
                {chatMode === 'confirm' && inquiryDraft && (
                  <div style={{
                    marginLeft: 34, marginTop: 4,
                    background: 'var(--bg-color)', border: '1.5px solid #3b82f6',
                    borderRadius: 14, padding: 14,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                      <span>📋</span>
                      <span style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-color)' }}>Confirm Your Request</span>
                    </div>
                    {inquiryType && <ConfirmRow label="Type" value={INQUIRY_TYPE_LABELS[inquiryType]} />}
                    {inquiryDraft.partName && <ConfirmRow label="Product / Part" value={inquiryDraft.partName} />}
                    {inquiryDraft.vehicleMake && <ConfirmRow label="Make" value={inquiryDraft.vehicleMake} />}
                    {inquiryDraft.vehicleModel && <ConfirmRow label="Model" value={inquiryDraft.vehicleModel} />}
                    {inquiryDraft.vehicleYear && <ConfirmRow label="Year" value={inquiryDraft.vehicleYear} />}
                    {inquiryDraft.partNumber && <ConfirmRow label="Part #" value={inquiryDraft.partNumber} />}
                    {inquiryDraft.quantity && <ConfirmRow label="Qty" value={String(inquiryDraft.quantity)} />}
                    {inquiryDraft.urgency && <ConfirmRow label="Urgency" value={inquiryDraft.urgency} />}
                    {inquiryDraft.notes && <ConfirmRow label="Notes" value={inquiryDraft.notes} />}
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button
                        onClick={handleEditInquiry}
                        style={{
                          flex: 1, padding: '9px', borderRadius: 10, cursor: 'pointer',
                          border: '1px solid var(--border-color)', background: 'transparent',
                          color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                        }}
                      >✏️ Edit</button>
                      <button
                        onClick={handleSubmitInquiry}
                        style={{
                          flex: 2, padding: '9px', borderRadius: 10, cursor: 'pointer',
                          border: 'none', background: '#3b82f6',
                          color: '#fff', fontSize: 13, fontWeight: 700,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
                        }}
                      >✅ Submit Request</button>
                    </div>
                  </div>
                )}

                {/* Saving */}
                {chatMode === 'saving' && (
                  <div style={{
                    marginLeft: 34, marginTop: 4,
                    display: 'flex', alignItems: 'center', gap: 10,
                    background: 'var(--bg-color)', border: '1px solid var(--border-color)',
                    borderRadius: 14, padding: 14,
                  }}>
                    <div className="rg-spinner-sm" />
                    <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Submitting your request...</span>
                  </div>
                )}

                {/* Success */}
                {chatMode === 'saved' && (
                  <div style={{
                    marginLeft: 34, marginTop: 4,
                    background: 'var(--bg-color)', border: '1.5px solid #22c55e',
                    borderRadius: 14, padding: 14, display: 'flex', flexDirection: 'column', gap: 10,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 22 }}>✅</span>
                      <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-color)' }}>Request Submitted!</span>
                    </div>
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                      We'll contact you when we have an update.
                      {savedRequestId ? ` Ref: ${savedRequestId.slice(-8).toUpperCase()}` : ''}
                    </p>
                    {whatsappLink && (
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                          background: '#25D366', color: '#fff', borderRadius: 10,
                          padding: '11px', fontWeight: 700, fontSize: 14, textDecoration: 'none',
                        }}
                      >💬 Chat on WhatsApp</a>
                    )}
                    <button
                      onClick={() => { setChatMode('idle'); setInquiryType(null); setInquiryDraft(null); setShowQuickReplies(true); }}
                      style={{
                        background: 'transparent', border: '1px solid var(--border-color)',
                        borderRadius: 10, padding: '9px', cursor: 'pointer',
                        color: 'var(--text-secondary)', fontSize: 13,
                      }}
                    >Ask something else</button>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input bar */}
          {chatMode !== 'gate' && chatMode !== 'saving' && chatMode !== 'saved' && (
            <div style={{
              borderTop: '1px solid var(--border-color)',
              background: 'var(--card-bg)',
              flexShrink: 0,
            }}>
              {/* Pending image preview */}
              {pendingImage && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px', borderBottom: '1px solid var(--border-color)',
                }}>
                  <img src={pendingImage.dataUrl} alt="pending" style={{ width: 40, height: 40, borderRadius: 6, objectFit: 'cover' }} />
                  <span style={{ flex: 1, fontSize: 13, color: 'var(--text-secondary)' }}>Image ready to send</span>
                  <button onClick={() => setPendingImage(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 18, lineHeight: 1 }}>×</button>
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, padding: '10px 10px 12px' }}>
                {/* Image attach */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  title="Attach image"
                  style={{
                    width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                    background: 'var(--bg-color)', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#64748b', fontSize: 16, marginBottom: 1,
                  }}
                >📎</button>
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />

                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={chatMode === 'collecting' ? 'Answer the question above...' : 'Ask me anything...'}
                  rows={1}
                  disabled={chatMode === 'confirm'}
                  style={{
                    flex: 1, background: 'var(--bg-color)', border: '1px solid var(--border-color)',
                    borderRadius: 22, padding: '9px 14px', color: 'var(--text-color)',
                    fontSize: 14, lineHeight: '20px', resize: 'none', outline: 'none',
                    maxHeight: 100, fontFamily: "'Inter', sans-serif",
                    opacity: chatMode === 'confirm' ? 0.5 : 1,
                  }}
                />

                <button
                  onClick={() => handleSend()}
                  disabled={(!input.trim() && !pendingImage) || loading || chatMode === 'confirm'}
                  style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    background: (input.trim() || pendingImage) && !loading && chatMode !== 'confirm' ? '#3b82f6' : 'var(--border-color)',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 1, transition: 'background 0.2s',
                  }}
                >
                  {loading ? (
                    <span className="rg-spinner-sm" style={{ borderColor: '#fff', borderTopColor: 'transparent' }} />
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx global>{`
        @keyframes rgBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
        @keyframes rgSpin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

        .rg-typing {
          display: inline-flex;
          align-items: center;
          gap: 5px;
        }
        .rg-typing span {
          display: inline-block;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #64748b;
          animation: rgBounce 1.2s ease-in-out infinite;
        }
        .rg-typing span:nth-child(1) { animation-delay: 0s; }
        .rg-typing span:nth-child(2) { animation-delay: 0.15s; }
        .rg-typing span:nth-child(3) { animation-delay: 0.3s; }

        .rg-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--border-color);
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: rgSpin 0.8s linear infinite;
          margin: 0 auto;
        }
        .rg-spinner-sm {
          display: inline-block;
          width: 16px;
          height: 16px;
          border: 2px solid var(--border-color);
          border-top-color: #3b82f6;
          border-radius: 50%;
          animation: rgSpin 0.8s linear infinite;
          flex-shrink: 0;
        }
      `}</style>
    </>
  );
}

const inputStyle = {
  width: '100%',
  background: 'var(--bg-color)',
  border: '1px solid var(--border-color)',
  borderRadius: 10,
  padding: '11px 14px',
  color: 'var(--text-color)',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: "'Inter', sans-serif",
};
