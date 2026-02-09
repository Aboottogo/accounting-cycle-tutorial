import React, { useState, useRef } from 'react';
import { db } from '../lib/db';

function EmailStep({ onSendEmail }) {
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = inputRef.current?.value?.trim();
    if (!email) return;
    onSendEmail(email);
    db.auth.sendMagicCode({ email }).catch((err) => {
      alert('Uh oh: ' + (err.body?.message || err.message || 'Failed to send code'));
      onSendEmail('');
    });
  };

  return (
    <form key="email" onSubmit={handleSubmit} className="login-form">
      <h2 className="login-title">Log in to Accounting Cycle</h2>
      <p className="login-text">
        Enter your email and we&apos;ll send you a verification code. We&apos;ll create an account for you if you don&apos;t already have one.
      </p>
      <input
        ref={inputRef}
        type="email"
        className="login-input"
        placeholder="Enter your email"
        required
        autoFocus
      />
      <button type="submit" className="login-btn">
        Send Code
      </button>
    </form>
  );
}

function CodeStep({ sentEmail }) {
  const inputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = inputRef.current?.value?.trim();
    if (!code) return;
    db.auth.signInWithMagicCode({ email: sentEmail, code }).catch((err) => {
      if (inputRef.current) inputRef.current.value = '';
      alert('Uh oh: ' + (err.body?.message || err.message || 'Invalid or expired code'));
    });
  };

  return (
    <form key="code" onSubmit={handleSubmit} className="login-form">
      <h2 className="login-title">Enter your code</h2>
      <p className="login-text">
        We sent an email to <strong>{sentEmail}</strong>. Check your inbox and paste the code here.
      </p>
      <input
        ref={inputRef}
        type="text"
        className="login-input"
        placeholder="123456..."
        required
        autoFocus
      />
      <button type="submit" className="login-btn">
        Verify Code
      </button>
    </form>
  );
}

export function Login() {
  const [sentEmail, setSentEmail] = useState('');

  return (
    <div className="login-screen">
      <div className="login-card">
        {!sentEmail ? (
          <EmailStep onSendEmail={setSentEmail} />
        ) : (
          <CodeStep sentEmail={sentEmail} />
        )}
      </div>
    </div>
  );
}
