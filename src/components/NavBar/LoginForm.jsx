import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Alert, Nav, Tab, InputGroup } from 'react-bootstrap';
import { LoginHandler } from '@/services/LoginHandler';
import { PersonCircle, Envelope, Lock, Magic, Eye, EyeSlash, ArrowRightShort, SendFill } from 'react-bootstrap-icons';

export const LoginForm = ({ show, onHide, useStore }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const setAlarms = useStore((state) => state.setAlarms);
  const session = useStore((state) => state.session);
  const accountCreationEnabled = useStore((state) => state.Account_Creation);
  const blockedMagicLinkDomains = useStore((state) => state.blocked_magic_link_domains) || [];

  // Auto-close modal when session becomes active (successful login)
  useEffect(() => {
    if (show && session) {
      onHide();
      setEmail('');
      setPassword('');
      setError('');
      setSuccessMsg('');
    }
  }, [show, session, onHide]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    const loginHandler = new LoginHandler(setIsLoading, setError, setAlarms);
    await loginHandler.login(email, password);
  };

  const sendPasswordResetEmail = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
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
      setSuccessMsg('Password reset email sent! Please check your inbox.');
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    }
    setIsLoading(false);
  };

  const sendMagicLink = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    if (!email) {
      setError('Please enter your email address for the magic link.');
      return;
    }

    // Front-end validation
    const emailDomain = '@' + email.split('@')[1];
    if (blockedMagicLinkDomains.includes(emailDomain)) {
      setError(`The domain ${emailDomain} is not authorized for magic link logins.`);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/magicLink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send magic link.');
      }
      setSuccessMsg('Magic link sent! Please check your inbox.');
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
        <div className="text-center mb-3">
          <h6 className="fw-bold mb-1">Welcome back to Teachy Time</h6>
          <p className="text-muted small mb-0">Select your preferred sign-in method</p>
        </div>

        {error && <Alert variant="danger" className="mb-3 py-2 small border-0"><i className="bi bi-exclamation-circle-fill me-1"></i> {error}</Alert>}
        {successMsg && <Alert variant="success" className="mb-3 py-2 small border-0"><i className="bi bi-check-circle-fill me-1"></i> {successMsg}</Alert>}
        
        <Tab.Container defaultActiveKey="password">
          <Nav variant="pills" className="nav-justified mb-3 custom-nav-pills-modal login-dropdown-menu border-0 shadow-none w-100 p-0 m-0" style={{ fontSize: '0.95rem' }}>
            <Nav.Item>
              <Nav.Link eventKey="password" onClick={() => { setError(''); setSuccessMsg(''); }} className="py-2">
                <Lock className="me-1" size={14} /> Password
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="magiclink" onClick={() => { setError(''); setSuccessMsg(''); }} className="py-2">
                <Magic className="me-1" size={14} /> Magic Link
              </Nav.Link>
            </Nav.Item>
          </Nav>

          <Tab.Content>
            <Tab.Pane eventKey="password">
              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold text-secondary mb-1">
                    Email Address
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light text-secondary border-end-0"><Envelope size={14} /></InputGroup.Text>
                    <Form.Control 
                      type="email" 
                      placeholder="teacher@school.edu" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-start-0 ps-0 form-control-focus-ring"
                      required
                    />
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-2">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <Form.Label className="small fw-semibold text-secondary mb-0">Password</Form.Label>
                    <a href="#" onClick={sendPasswordResetEmail} className="text-decoration-none small text-primary">Forgot?</a>
                  </div>
                  <InputGroup>
                    <InputGroup.Text className="bg-light text-secondary border-end-0"><Lock size={14} /></InputGroup.Text>
                    <Form.Control 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-start-0 border-end-0 ps-0"
                      required
                    />
                    <Button variant="outline-secondary" className="border-start-0 password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                    </Button>
                  </InputGroup>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Check 
                    type="checkbox"
                    id="modalRememberMe"
                    label="Remember me for 30 days"
                    className="small text-secondary"
                  />
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={isLoading}
                  className="w-100 fw-semibold d-flex align-items-center justify-content-center gap-2"
                >
                  <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
                  {!isLoading && <ArrowRightShort size={24} />}
                </Button>
              </Form>
            </Tab.Pane>

            <Tab.Pane eventKey="magiclink">
              <div className="alert alert-info py-2 px-3 small border-0 bg-info-subtle text-info-emphasis mb-3">
                <i className="bi bi-info-circle me-1"></i> We'll email you a secure link so you can sign in without a password.
              </div>
              <Form onSubmit={sendMagicLink}>
                <Form.Group className="mb-4">
                  <Form.Label className="small fw-semibold text-secondary mb-1">
                    Work or School Email
                  </Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light text-secondary border-end-0"><Envelope size={14} /></InputGroup.Text>
                    <Form.Control 
                      type="email" 
                      placeholder="teacher@school.edu" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-start-0 ps-0"
                      required
                    />
                  </InputGroup>
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  disabled={isLoading}
                  className="w-100 fw-semibold d-flex align-items-center justify-content-center gap-2"
                >
                  <SendFill size={14} />
                  <span>{isLoading ? 'Sending...' : 'Send Magic Link'}</span>
                </Button>
              </Form>
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>

        <hr className="my-3 text-border" />
        <div className="text-center">
          <span className="small text-muted">Don't have an account? </span>
          {accountCreationEnabled ? (
            <a href="#" onClick={(e) => { e.preventDefault(); alert("Sign up coming soon!"); }} className="small text-primary fw-semibold text-decoration-none">
              Create Account
            </a>
          ) : (
             <span className="small text-muted text-decoration-line-through">Create Account</span>
          )}
        </div>
      </Modal.Body>
    </Modal>
  );
};
