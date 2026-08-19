import React, { useState } from 'react';
import { Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { PersonExclamation, ExclamationTriangleFill, Lock, Envelope, Eye, EyeSlash, PersonCircle, CheckCircleFill, Circle, XCircleFill, Check2Circle } from 'react-bootstrap-icons';
import { LegalModal } from '@/components/Legal/LegalModal';

export const SignupFormComponent = ({
  accountCreationEnabled,
  onBackToLogin,
  isDarkTheme,
  onLegalModalToggle
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showLegalModal, setShowLegalModal] = useState(false);
  const [legalModalType, setLegalModalType] = useState('terms');

  const handleOpenLegalModal = (type) => {
    setLegalModalType(type);
    setShowLegalModal(true);
    onLegalModalToggle?.(true);
  };

  const handleCloseLegalModal = () => {
    setShowLegalModal(false);
    onLegalModalToggle?.(false);
  };
  
  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const lengthValid = password.length >= 8;
  const numberValid = /\d/.test(password);
  const specialValid = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  let strengthScore = 0;
  if (lengthValid) strengthScore++;
  if (numberValid) strengthScore++;
  if (specialValid) strengthScore++;

  let meterColor = '#e9ecef';
  let meterWidth = '0%';
  let strengthText = 'None';
  let strengthClass = 'text-muted';

  if (password.length > 0) {
    switch (strengthScore) {
      case 1:
        meterWidth = '33%';
        meterColor = '#dc3545';
        strengthText = 'Weak';
        strengthClass = 'text-danger';
        break;
      case 2:
        meterWidth = '66%';
        meterColor = '#ffc107';
        strengthText = 'Medium';
        strengthClass = 'text-warning';
        break;
      case 3:
        meterWidth = '100%';
        meterColor = '#198754';
        strengthText = 'Strong';
        strengthClass = 'text-success';
        break;
    }
  }

  const validateField = (field, value, overrideTerms = termsAccepted) => {
    let error = '';
    if (field === 'fullName') {
      if (!value.trim()) error = 'Full name is required.';
    } else if (field === 'email') {
      if (!value) {
        error = 'Email address is required.';
      } else if (!/\S+@\S+\.\S+/.test(value)) {
        error = 'Please enter a valid email address.';
      }
    } else if (field === 'password') {
      if (!value) {
        error = 'Password is required.';
      } else if (strengthScore < 3) {
        error = 'Please satisfy all password requirements.';
      }
    } else if (field === 'confirmPassword') {
      if (!value) {
        error = 'Please confirm your password.';
      } else if (value !== password) {
        error = 'Passwords do not match.';
      }
    } else if (field === 'terms') {
      if (!overrideTerms) {
        error = 'You must agree to the Terms of Service and Privacy Policy.';
      }
    }

    setErrors(prev => ({ ...prev, [field]: error }));
    return !error;
  };

  const handleBlur = (field, value) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateField(field, value);
  };

  const handleChange = (field, value, setter) => {
    setter(value);
    if (touched[field]) {
      if (field === 'terms') {
        validateField(field, value, value);
      } else {
        validateField(field, value);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accountCreationEnabled) return;
    
    setGlobalError('');
    setSuccess('');
    
    const newTouched = { fullName: true, email: true, password: true, confirmPassword: true, terms: true };
    setTouched(newTouched);
    
    const isFullNameValid = validateField('fullName', fullName);
    const isEmailValid = validateField('email', email);
    const isPasswordValid = validateField('password', password);
    const isConfirmPasswordValid = validateField('confirmPassword', confirmPassword);
    const isTermsValid = validateField('terms', termsAccepted, termsAccepted);

    if (!isFullNameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid || !isTermsValid) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, full_name: fullName }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create account.");
      }

      setIsSubmitted(true);

    } catch (err) {
      setGlobalError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!accountCreationEnabled) {
    return (
      <div className="text-center py-4">
        <div className="d-inline-flex align-items-center justify-content-center bg-warning bg-opacity-10 text-warning rounded-circle mb-3" style={{ width: '56px', height: '56px', fontSize: '1.75rem' }}>
          <PersonExclamation />
        </div>
        <h5 className="fw-bold text-dark mb-2">Account Creation is Currently Disabled</h5>
        <p className="text-muted small mb-3">
          We are temporarily pausing new user registrations while we complete scheduled system updates.
        </p>
        <div className="alert bg-warning bg-opacity-10 border-warning border-opacity-25 text-start p-3 mb-4 text-dark text-start">
          <div className="d-flex gap-2">
            <ExclamationTriangleFill className="fs-5 text-warning flex-shrink-0" />
            <div>
              <strong className="d-block small mb-1">Existing Users & Invited Teachers</strong>
              <span className="small opacity-75">If you already have an account or received an invitation link, you can log in.</span>
            </div>
          </div>
        </div>
        <Button variant="primary" className="w-100" onClick={onBackToLogin}>
          Back to Sign In
        </Button>
      </div>
    );
  }

  if (isSubmitted) {
    return (
      <div className="text-center py-4">
        <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle mb-3" style={{ width: '56px', height: '56px', fontSize: '1.75rem' }}>
          <Envelope />
        </div>
        <h5 className={`fw-bold mb-2 ${isDarkTheme ? 'text-white' : 'text-dark'}`}>Check your email</h5>
        <p className={`small mb-4 ${isDarkTheme ? 'text-white-50' : 'text-muted'}`}>
          We've sent a verification link to <strong className={isDarkTheme ? 'text-white' : 'text-dark'}>{email}</strong>. 
          Please click the link to verify your account before signing in.
        </p>
        <Button variant="primary" className="w-100 fw-semibold" onClick={onBackToLogin}>
          Back to Sign In
        </Button>
      </div>
    );
  }

  const baseInputGroupTextClass = isDarkTheme  
    ? "bg-custom-dark text-white border-custom-dark border-end-0" 
    : "bg-light text-secondary border-end-0";
  const baseInputClass = isDarkTheme 
    ? "border-custom-dark border-start-0 ps-2 form-control-focus-ring"
    : "border-start-0 ps-0 form-control-focus-ring";
  const baseInputMiddleClass = isDarkTheme 
    ? "border-custom-dark border-start-0 border-end-0 ps-2 form-control-focus-ring"
    : "border-start-0 border-end-0 ps-0 form-control-focus-ring";
  const baseToggleBtnClass = isDarkTheme
    ? "border-custom-dark border-start-0 password-toggle-btn"
    : "border-start-0 password-toggle-btn";
  const textClass = isDarkTheme ? "text-white-50" : "text-secondary";

  const getIconClass = (field) => {
    return `${baseInputGroupTextClass} ${touched[field] && errors[field] ? 'border-danger text-danger' : ''}`;
  };
  const getInputClass = (field) => {
    return `${baseInputClass} ${touched[field] && errors[field] ? 'border-danger' : ''}`;
  };
  const getMiddleInputClass = (field) => {
    return `${baseInputMiddleClass} ${touched[field] && errors[field] ? 'border-danger' : ''}`;
  };
  const getToggleBtnClass = (field) => {
    return `${baseToggleBtnClass} ${touched[field] && errors[field] ? 'border-danger text-danger' : ''}`;
  };

  return (
    <div className="pt-2">
      {globalError && <Alert variant="danger" className="mb-3 py-2 small border-0"><i className="bi bi-exclamation-circle-fill me-1"></i> {globalError}</Alert>}
      {success && <Alert variant="success" className="mb-3 py-2 small border-0"><i className="bi bi-check-circle-fill me-1"></i> {success}</Alert>}

      <Form onSubmit={handleSubmit} noValidate>
        <Form.Group className="mb-3">
          <Form.Label className={`small fw-semibold mb-1 ${textClass}`}>Full Name</Form.Label>
          <InputGroup className={touched.fullName && errors.fullName ? 'is-invalid' : ''}>
            <InputGroup.Text className={getIconClass('fullName')}><PersonCircle size={14} /></InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="e.g. Dr. Sarah Jenkins"
              value={fullName}
              onChange={(e) => handleChange('fullName', e.target.value, setFullName)}
              onBlur={(e) => handleBlur('fullName', e.target.value)}
              disabled={loading}
              className={getInputClass('fullName')}
              isInvalid={touched.fullName && !!errors.fullName}
            />
          </InputGroup>
          {touched.fullName && errors.fullName && <div className="text-danger small mt-1">{errors.fullName}</div>}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className={`small fw-semibold mb-1 ${textClass}`}>Email Address</Form.Label>
          <InputGroup className={touched.email && errors.email ? 'is-invalid' : ''}>
            <InputGroup.Text className={getIconClass('email')}><Envelope size={14} /></InputGroup.Text>
            <Form.Control
              type="email"
              placeholder="name@school.edu"
              value={email}
              onChange={(e) => handleChange('email', e.target.value, setEmail)}
              onBlur={(e) => handleBlur('email', e.target.value)}
              disabled={loading}
              className={getInputClass('email')}
              isInvalid={touched.email && !!errors.email}
            />
          </InputGroup>
          {touched.email && errors.email && <div className="text-danger small mt-1">{errors.email}</div>}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className={`small fw-semibold mb-1 ${textClass}`}>Password</Form.Label>
          <InputGroup className={touched.password && errors.password ? 'is-invalid' : ''}>
            <InputGroup.Text className={getIconClass('password')}><Lock size={14} /></InputGroup.Text>
            <Form.Control
              type={showPassword ? "text" : "password"}
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => handleChange('password', e.target.value, setPassword)}
              onBlur={(e) => handleBlur('password', e.target.value)}
              disabled={loading}
              className={getMiddleInputClass('password')}
              isInvalid={touched.password && !!errors.password}
            />
            <Button variant="outline-secondary" className={getToggleBtnClass('password')} onClick={() => setShowPassword(!showPassword)} disabled={loading}>
              {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
            </Button>
          </InputGroup>
          
          <div className="mt-2">
            <div className="strength-meter">
              <div className="strength-meter-fill" style={{ width: meterWidth, backgroundColor: meterColor, height: '4px', borderRadius: '2px', transition: 'width 0.3s' }}></div>
            </div>
            <div className="d-flex justify-content-between align-items-center mt-1">
              <span className="small text-muted" style={{ fontSize: '0.75rem' }}>Password Strength:</span>
              <span className={`small fw-semibold ${strengthClass}`} style={{ fontSize: '0.75rem' }}>{strengthText}</span>
            </div>
          </div>
          
          <div className={`p-3 rounded-3 mt-2 mb-2 ${isDarkTheme ? 'bg-black bg-opacity-25 border border-secondary border-opacity-25' : 'bg-light'}`}>
            <span className={`d-block small fw-semibold mb-2 ${isDarkTheme ? 'text-white-50' : 'text-secondary'}`}>Password must contain:</span>
            <ul className={`list-unstyled small mb-0 d-flex flex-column gap-1 ${isDarkTheme ? 'text-white-50' : 'text-muted'}`} style={{ fontSize: '0.8rem' }}>
              <li className={`d-flex align-items-center gap-2 ${lengthValid ? (isDarkTheme ? 'text-white' : 'text-dark') : ''}`}>
                {lengthValid ? <CheckCircleFill className="text-success" /> : <Circle className={isDarkTheme ? 'text-white-50 opacity-50' : 'text-secondary'} />}
                At least 8 characters long
              </li>
              <li className={`d-flex align-items-center gap-2 ${numberValid ? (isDarkTheme ? 'text-white' : 'text-dark') : ''}`}>
                {numberValid ? <CheckCircleFill className="text-success" /> : <Circle className={isDarkTheme ? 'text-white-50 opacity-50' : 'text-secondary'} />}
                At least one number (0-9)
              </li>
              <li className={`d-flex align-items-center gap-2 ${specialValid ? (isDarkTheme ? 'text-white' : 'text-dark') : ''}`}>
                {specialValid ? <CheckCircleFill className="text-success" /> : <Circle className={isDarkTheme ? 'text-white-50 opacity-50' : 'text-secondary'} />}
                At least one special character (!@#$%^&*)
              </li>
            </ul>
          </div>
          {touched.password && errors.password && <div className="text-danger small mt-1">{errors.password}</div>}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label className={`small fw-semibold mb-1 ${textClass}`}>Confirm Password</Form.Label>
          <InputGroup className={touched.confirmPassword && errors.confirmPassword ? 'is-invalid' : ''}>
            <InputGroup.Text className={getIconClass('confirmPassword')}><Check2Circle size={14} /></InputGroup.Text>
            <Form.Control
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => handleChange('confirmPassword', e.target.value, setConfirmPassword)}
              onBlur={(e) => handleBlur('confirmPassword', e.target.value)}
              disabled={loading}
              className={getMiddleInputClass('confirmPassword')}
              isInvalid={touched.confirmPassword && !!errors.confirmPassword}
            />
            <Button variant="outline-secondary" className={getToggleBtnClass('confirmPassword')} onClick={() => setShowConfirmPassword(!showConfirmPassword)} disabled={loading}>
              {showConfirmPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
            </Button>
          </InputGroup>
          {confirmPassword.length > 0 && (
            <div className={`small mt-1 fw-semibold d-flex align-items-center gap-1 ${passwordsMatch ? 'text-success' : 'text-danger'}`}>
              {passwordsMatch ? <CheckCircleFill size={12} /> : <XCircleFill size={12} />}
              <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
            </div>
          )}
          {touched.confirmPassword && errors.confirmPassword && errors.confirmPassword !== 'Passwords do not match.' && (
            <div className="text-danger small mt-1">{errors.confirmPassword}</div>
          )}
        </Form.Group>

        <Form.Group className="mb-4">
          <Form.Check
            type="checkbox"
            id="termsCheck"
            label={
              <span className={`small ${textClass}`}>
                I agree to the{' '}
                <a
                  href="#terms"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleOpenLegalModal('terms');
                  }}
                  className={`text-decoration-underline fw-medium ${isDarkTheme ? 'text-white' : 'text-dark'}`}
                  style={{ cursor: 'pointer' }}
                >
                  Terms of Service
                </a>{' '}
                and{' '}
                <a
                  href="#privacy"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleOpenLegalModal('privacy');
                  }}
                  className={`text-decoration-underline fw-medium ${isDarkTheme ? 'text-white' : 'text-dark'}`}
                  style={{ cursor: 'pointer' }}
                >
                  Privacy Policy
                </a>.
              </span>
            }
            checked={termsAccepted}
            onChange={(e) => handleChange('terms', e.target.checked, setTermsAccepted)}
            onBlur={(e) => handleBlur('terms', termsAccepted)}
            disabled={loading}
            className={`small ${touched.terms && errors.terms ? 'is-invalid text-danger' : ''}`}
            isInvalid={touched.terms && !!errors.terms}
          />
          {touched.terms && errors.terms && <div className="text-danger small mt-1">{errors.terms}</div>}
        </Form.Group>

        <Button type="submit" variant="primary" className="w-100 fw-semibold mb-3" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
        
        <div className="text-center pt-2 border-top">
          <span className={`small ${textClass}`}>Already have an account? </span>
          <a href="#" onClick={(e) => { e.preventDefault(); onBackToLogin(); }} className="small text-primary fw-semibold text-decoration-none">
            Sign In
          </a>
        </div>
      </Form>

      <LegalModal
        show={showLegalModal}
        onHide={handleCloseLegalModal}
        initialType={legalModalType}
      />
    </div>
  );
};
