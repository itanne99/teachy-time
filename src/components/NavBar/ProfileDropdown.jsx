import React, { useState, forwardRef } from 'react';
import { Dropdown, Form, Button, Alert } from 'react-bootstrap';
import { LoginHandler } from '@/services/LoginHandler';
import supabase from '@/supabase/component';
import { PersonCircle, Envelope, Lock } from 'react-bootstrap-icons';

const CustomToggle = forwardRef(({ children, onClick }, ref) => (
  <Button
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
    variant="outline-light"
    className="d-flex align-items-center gap-2 px-3"
  >
    <PersonCircle size={18} />
    {children}
  </Button>
));

function ProfileDropdown({ useStore }) {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const setAlarms = useStore((state) => state.setAlarms);

  const handleLogin = async (e) => {
    e.preventDefault();
    const loginHandler = new LoginHandler(setIsLoading, setError, setAlarms);
    await loginHandler.login(email, password);
  };

  const sendPasswordResetEmail = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address to reset your password.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/passwordRecovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send password reset email.');
      }
      setError('');
      alert('Password reset email sent! Please check your inbox.');
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    }
    setIsLoading(false);
  };


  return (
    <Dropdown>
      <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
        Sign In
      </Dropdown.Toggle>

      <Dropdown.Menu align="end" className="p-0 border-0 shadow-lg" style={{ minWidth: '300px', borderRadius: '12px', overflow: 'hidden' }}>
        <div className="bg-primary bg-gradient text-white p-3 text-center">
          <PersonCircle size={40} />
          <h6 className="mb-0 mt-2">Welcome Back</h6>
          <small className="opacity-75">Sign in to your account</small>
        </div>
        
        <div className="p-3">
          {error && <Alert variant="danger" className="mb-3 py-2 small">{error}</Alert>}
          <Form onSubmit={handleLogin}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label className="small text-muted mb-1">
                <Envelope size={14} className="me-1" />
                Email
              </Form.Label>
              <Form.Control 
                type="email" 
                placeholder="you@example.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="form-control-sm border border-2"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label className="small text-muted mb-1">
                <Lock size={14} className="me-1" />
                Password
              </Form.Label>
              <Form.Control 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="form-control-sm border border-2"
              />
            </Form.Group>

            <div className="d-flex justify-content-between align-items-center mb-3">
              <Button 
                variant="link" 
                className="p-0 text-decoration-none small" 
                onClick={sendPasswordResetEmail} 
                disabled={isLoading}
              >
                Forgot password?
              </Button>
            </div>

            <div className="d-grid">
              <Button 
                variant="primary" 
                type="submit" 
                disabled={isLoading}
                className="fw-semibold"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </div>
          </Form>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
}
export default ProfileDropdown;