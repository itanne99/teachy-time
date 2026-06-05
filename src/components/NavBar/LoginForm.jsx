import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { LoginHandler } from '@/services/LoginHandler';
import { PersonCircle, Envelope, Lock } from 'react-bootstrap-icons';

export const LoginForm = ({ show, onHide, useStore }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const setAlarms = useStore((state) => state.setAlarms);

  const handleLogin = async (e) => {
    e.preventDefault();
    const loginHandler = new LoginHandler(setIsLoading, setError, setAlarms);
    await loginHandler.login(email, password);
    // Close modal after successful login (session is set by LoginHandler)
    if (!error) {
      setTimeout(() => {
        onHide();
        setEmail('');
        setPassword('');
      }, 500);
    }
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
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="d-flex align-items-center gap-2">
          <PersonCircle size={22} className="text-primary" />
          Sign In
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-2">
        {error && <Alert variant="danger" className="mb-3 py-2 small">{error}</Alert>}
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3" controlId="modalEmail">
            <Form.Label className="small fw-semibold text-muted d-flex align-items-center gap-1">
              <Envelope size={14} />
              Email
            </Form.Label>
            <Form.Control 
              type="email" 
              placeholder="you@example.com" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="border-2"
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="modalPassword">
            <Form.Label className="small fw-semibold text-muted d-flex align-items-center gap-1">
              <Lock size={14} />
              Password
            </Form.Label>
            <Form.Control 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="border-2"
            />
          </Form.Group>

          <div className="d-flex justify-content-end mb-3">
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
      </Modal.Body>
    </Modal>
  );
};
