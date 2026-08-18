import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Modal, Form, Button, Alert, Nav, Tab, InputGroup } from 'react-bootstrap';
import { LoginHandler } from '@/services/LoginHandler';
import { PersonCircle, Envelope, Lock, Magic, Eye, EyeSlash, ArrowRightShort, SendFill } from 'react-bootstrap-icons';
import { SignupFormComponent } from './SignupFormComponent';

export const LoginForm = ({ show, onHide, useStore }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [view, setView] = useState('login'); // 'login' or 'signup'
  const setAlarms = useStore((state) => state.setAlarms);
  const session = useStore((state) => state.session);
  const accountCreationEnabled = useStore((state) => state.Account_Creation);
  const blockedMagicLinkDomains = useStore((state) => state.blocked_magic_link_domains) || [];
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

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

  const validateEmail = (val) => {
    if (!val) return 'Email address is required.';
    if (!/\S+@\S+\.\S+/.test(val)) return 'Please enter a valid email address.';
    return '';
  };

  const validatePassword = (val) => {
    if (!val) return 'Password is required.';
    return '';
  };

  const handleBlur = (field, value) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    let err = '';
    if (field === 'email') err = validateEmail(value);
    if (field === 'password') err = validatePassword(value);
    setErrors(prev => ({ ...prev, [field]: err }));
  };

  const handleChange = (field, value, setter) => {
    setter(value);
    if (touched[field]) {
      let err = '';
      if (field === 'email') err = validateEmail(value);
      if (field === 'password') err = validatePassword(value);
      setErrors(prev => ({ ...prev, [field]: err }));
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    setTouched(prev => ({ ...prev, email: true, password: true }));
    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);
    setErrors(prev => ({ ...prev, email: emailErr, password: passErr }));
    
    if (emailErr || passErr) return;

    setError('');
    setSuccessMsg('');
    const loginHandler = new LoginHandler(setIsLoading, setError, setAlarms);
    await loginHandler.login(email, password);
  };

  const sendPasswordResetEmail = async (e) => {
    e.preventDefault();
    setTouched(prev => ({ ...prev, email: true }));
    const emailErr = validateEmail(email);
    setErrors(prev => ({ ...prev, email: emailErr }));
    
    if (emailErr) return;

    setError('');
    setSuccessMsg('');
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
    setTouched(prev => ({ ...prev, email: true }));
    const emailErr = validateEmail(email);
    setErrors(prev => ({ ...prev, email: emailErr }));
    
    if (emailErr) return;

    setError('');
    setSuccessMsg('');
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
          {view === 'login' ? 'Sign In' : 'Sign Up'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-2">
        <div className="text-center mb-3">
          <h6 className="fw-bold mb-1">{view === 'login' ? 'Welcome back to Teachy Time' : 'Create Your Account'}</h6>
          <p className="text-muted small mb-0">{view === 'login' ? 'Select your preferred sign-in method' : 'Join Teachy Time to organize your schedule'}</p>
        </div>

        {view === 'signup' ? (
          <SignupFormComponent 
            accountCreationEnabled={accountCreationEnabled} 
            onBackToLogin={() => setView('login')} 
            isDarkTheme={false}
          />
        ) : (
          <>
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
                  <Form onSubmit={handleLogin} noValidate>
                    <Form.Group className="mb-3">
                      <Form.Label className="small fw-semibold text-secondary mb-1">
                        Email Address
                      </Form.Label>
                      <InputGroup className={touched.email && errors.email ? 'is-invalid' : ''}>
                        <InputGroup.Text className={`bg-light text-secondary border-end-0 ${touched.email && errors.email ? 'border-danger text-danger' : ''}`}><Envelope size={14} /></InputGroup.Text>
                        <Form.Control 
                          type="email" 
                          placeholder="teacher@school.edu" 
                          value={email} 
                          onChange={(e) => handleChange('email', e.target.value, setEmail)}
                          onBlur={(e) => handleBlur('email', e.target.value)}
                          className={`border-start-0 ps-0 form-control-focus-ring ${touched.email && errors.email ? 'border-danger' : ''}`}
                          isInvalid={touched.email && !!errors.email}
                        />
                      </InputGroup>
                      {touched.email && errors.email && <div className="text-danger small mt-1">{errors.email}</div>}
                    </Form.Group>

                    <Form.Group className="mb-2">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <Form.Label className="small fw-semibold text-secondary mb-0">Password</Form.Label>
                        <a href="#" onClick={sendPasswordResetEmail} className="text-decoration-none small text-primary">Forgot?</a>
                      </div>
                      <InputGroup className={touched.password && errors.password ? 'is-invalid' : ''}>
                        <InputGroup.Text className={`bg-light text-secondary border-end-0 ${touched.password && errors.password ? 'border-danger text-danger' : ''}`}><Lock size={14} /></InputGroup.Text>
                        <Form.Control 
                          type={showPassword ? "text" : "password"} 
                          placeholder="••••••••" 
                          value={password} 
                          onChange={(e) => handleChange('password', e.target.value, setPassword)}
                          onBlur={(e) => handleBlur('password', e.target.value)}
                          className={`border-start-0 border-end-0 ps-0 ${touched.password && errors.password ? 'border-danger' : ''}`}
                          isInvalid={touched.password && !!errors.password}
                        />
                        <Button variant="outline-secondary" className={`border-start-0 password-toggle-btn ${touched.password && errors.password ? 'border-danger text-danger' : ''}`} onClick={() => setShowPassword(!showPassword)}>
                          {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                        </Button>
                      </InputGroup>
                      {touched.password && errors.password && <div className="text-danger small mt-1">{errors.password}</div>}
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
                  <Form onSubmit={sendMagicLink} noValidate>
                    <Form.Group className="mb-4">
                      <Form.Label className="small fw-semibold text-secondary mb-1">
                        Work or School Email
                      </Form.Label>
                      <InputGroup className={touched.email && errors.email ? 'is-invalid' : ''}>
                        <InputGroup.Text className={`bg-light text-secondary border-end-0 ${touched.email && errors.email ? 'border-danger text-danger' : ''}`}><Envelope size={14} /></InputGroup.Text>
                        <Form.Control 
                          type="email" 
                          placeholder="teacher@school.edu" 
                          value={email} 
                          onChange={(e) => handleChange('email', e.target.value, setEmail)}
                          onBlur={(e) => handleBlur('email', e.target.value)}
                          className={`border-start-0 ps-0 ${touched.email && errors.email ? 'border-danger' : ''}`}
                          isInvalid={touched.email && !!errors.email}
                        />
                      </InputGroup>
                      {touched.email && errors.email && <div className="text-danger small mt-1">{errors.email}</div>}
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
                <a href="#" onClick={(e) => { e.preventDefault(); setView('signup'); }} className="small text-primary fw-semibold text-decoration-none">
                  Sign up
                </a>
              ) : (
                 <span className="small text-muted text-decoration-line-through">Create Account</span>
              )}
            </div>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};
