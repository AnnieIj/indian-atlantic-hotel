import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import './Admin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login, fetchBookings, fetchPayments } = useContext(AppContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email.trim(), password);
    setIsLoading(false);

    if (result.success) {
      // Load admin data now that we're authenticated
      fetchBookings();
      fetchPayments();
      navigate('/admin/dashboard');
    } else {
      setError(result.message || 'Invalid admin credentials');
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-card glass-panel-dark">

        <div className="text-center mb-6">
          <img
            src="/logo.png"
            alt="Indian Atlantic Hotel"
            className="login-logo-img mx-auto mb-4"
            style={{ maxWidth: '180px', height: 'auto' }}
          />
          <h2 style={{ color: 'var(--color-text-light)', fontSize: '1.5rem' }}>
            Admin Portal
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Sign in to manage your hotel
          </p>
        </div>

        {error && (
          <div style={{
            color: '#fca5a5',
            textAlign: 'center',
            marginBottom: '16px',
            padding: '10px',
            background: 'rgba(239,68,68,0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(239,68,68,0.2)',
            fontSize: '0.9rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@hotel.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group" style={{ position: 'relative' }}>
            <label>Password</label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
              style={{ paddingRight: '3rem' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '12px',
                bottom: '12px',
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                padding: 0,
                display: 'flex',
                alignItems: 'center'
              }}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full mt-4"
            disabled={isLoading}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {isLoading ? (
              <>
                <span className="spinner-sm" style={{
                  width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block'
                }} />
                Signing in...
              </>
            ) : (
              <>
                <Lock size={16} /> Sign In
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};

export default AdminLogin;