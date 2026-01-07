import React, { useState, forwardRef } from 'react';
import { Dropdown, Form, Button, Alert } from 'react-bootstrap';
import { LoginHandler } from '@/services/LoginHandler';
import supabase from '@/supabase/component';

// Custom Toggle to remove the dropdown arrow
const CustomToggle = forwardRef(({ children, onClick }, ref) => (
  <Button
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
    variant="primary"
  >
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
        Login
      </Dropdown.Toggle>

      <Dropdown.Menu align="end" className="p-3" style={{ minWidth: '250px' }}>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Form.Group>

          <Form.Group className="mb-3 text-end">
            <Button variant="link" onClick={sendPasswordResetEmail} disabled={isLoading} style={{ padding: 0 }}>
              Forgot Password?
            </Button>
          </Form.Group>

          <div className="d-grid">
            <Button variant="secondary" type="submit" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </div>
        </Form>
      </Dropdown.Menu>
    </Dropdown>
  );
}
export default ProfileDropdown;