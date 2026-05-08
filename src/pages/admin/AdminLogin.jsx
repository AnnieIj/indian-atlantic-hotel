import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { Lock } from 'lucide-react';
import './Admin.css';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const res = login(email, password);
    if (res.success && res.user.role === 'admin') {
      navigate('/admin/dashboard');
    } else {
      setError('Invalid admin credentials.');
    }
  };

  return (
    <div className="admin-login-page">
      <div className="login-card glass-panel-dark">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="Indian Atlantic Hotel" className="login-logo-img mx-auto mb-4" style={{ maxWidth: '180px', height: 'auto' }} />
          <h2 style={{color: 'var(--color-text-light)', fontSize: '1.5rem'}}>Admin Portal</h2>
        </div>
        
        {error && <div className="error-msg mb-4" style={{color: '#fca5a5', textAlign: 'center'}}>{error}</div>}
        
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label style={{color: 'var(--color-text-light)'}}>Email Address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label style={{color: 'var(--color-text-light)'}}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary w-full mt-4">Login</button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
