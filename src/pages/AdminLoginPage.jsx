import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowLeft,
  ShieldCheck,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import { loginAdmin } from '../utils/authService';

export default function AdminLoginPage({ onLoginSuccess, onBackToSite }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('Please enter your administrator email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your administrator password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await loginAdmin(email, password);

      if (!res.success) {
        setErrorMessage(res.error || 'Authentication failed. Please verify credentials.');
        setIsLoading(false);
        return;
      }

      setSuccessNotice(true);
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(res.user);
        }
      }, 500);
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred during authentication.');
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      {/* Background ambient lighting elements */}
      <div className="admin-login-bg-glow glow-1" />
      <div className="admin-login-bg-glow glow-2" />

      {/* Top bar back link */}
      <div className="admin-login-top-bar">
        <button
          type="button"
          onClick={onBackToSite}
          className="admin-login-back-btn"
          title="Return to website"
        >
          <ArrowLeft size={16} />
          <span>Return to Website</span>
        </button>
      </div>

      <div className="admin-login-container">
        <div className="admin-login-card">
          {/* Header branding */}
          <div className="admin-login-header">
            <div className="admin-login-icon-badge">
              <ShieldCheck size={28} className="admin-gold-icon" />
            </div>
            <h1 className="admin-login-brand">
              <span className="brand-accent">iORA</span> STUDIO
            </h1>
            <p className="admin-login-subtitle">Private Administrative Portal</p>
            <div className="admin-login-divider">
              <span className="admin-login-badge">
                <Lock size={12} />
                <span>Restricted Access</span>
              </span>
            </div>
          </div>

          {/* Error notification banner */}
          {errorMessage && (
            <div className="admin-login-alert admin-login-alert-error" role="alert">
              <AlertCircle size={18} className="alert-icon" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success banner */}
          {successNotice && (
            <div className="admin-login-alert admin-login-alert-success">
              <CheckCircle2 size={18} className="alert-icon" />
              <span>Identity verified. Accessing studio dashboard...</span>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="admin-login-form" noValidate>
            <div className="admin-login-field">
              <label htmlFor="admin-email" className="admin-login-label">
                Admin Email Address
              </label>
              <div className="admin-login-input-wrap">
                <Mail size={18} className="admin-login-input-icon" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  placeholder="admin@iorastudio.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  className="admin-login-input"
                  disabled={isLoading || successNotice}
                />
              </div>
            </div>

            <div className="admin-login-field">
              <div className="admin-login-label-row">
                <label htmlFor="admin-password" className="admin-login-label">
                  Access Key / Password
                </label>
              </div>
              <div className="admin-login-input-wrap">
                <KeyRound size={18} className="admin-login-input-icon" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  className="admin-login-input password-input"
                  disabled={isLoading || successNotice}
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword(!showPassword)}
                  className="admin-password-toggle-btn"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="admin-login-submit-btn"
              disabled={isLoading || successNotice}
            >
              {isLoading ? (
                <>
                  <span className="admin-login-spinner" />
                  <span>Verifying Credentials...</span>
                </>
              ) : successNotice ? (
                <>
                  <CheckCircle2 size={18} />
                  <span>Access Granted</span>
                </>
              ) : (
                <>
                  <Lock size={16} />
                  <span>Authenticate & Enter</span>
                </>
              )}
            </button>
          </form>

          {/* Security footnote */}
          <div className="admin-login-footer">
            <p className="admin-security-note">
              <Sparkles size={13} className="admin-note-icon" />
              <span>Authorized personnel only. Sessions are encrypted and monitored.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
