import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, InputGroup } from 'react-bootstrap';
import { ShieldLockFill, KeyFill, Check2Circle, Eye, EyeSlash, CheckCircleFill, Circle, XCircleFill, ArrowLeft, ShieldCheck } from 'react-bootstrap-icons';
import Link from 'next/link';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Validation checks
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (strengthScore < 3) {
      setError('Please satisfy all password requirements.');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      // In a real application, extract access token from URL fragment and update user.
      // For this implementation, we simulate success as per UI workflow.
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to reset password. Link may be invalid or expired.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="flex-grow-1 d-flex align-items-center py-5">
      <Row className="justify-content-center w-100">
        <Col xs={12} md={8} lg={5}>
          
          <div className="auth-card">
            <div className="text-center mb-4">
              <div className="d-inline-flex align-items-center justify-content-center bg-primary-subtle text-primary rounded-circle mb-3" style={{ width: '56px', height: '56px' }}>
                <ShieldLockFill size={28} />
              </div>
              <h4 className="fw-bold mb-1">Set New Password</h4>
              <p className="text-muted small mb-0">Your new password must be different from previously used passwords.</p>
            </div>

            {error && <Alert variant="danger" className="small py-2">{error}</Alert>}
            
            {success ? (
              <Alert variant="success" className="mb-4">
                <div className="d-flex align-items-start gap-2">
                  <CheckCircleFill size={20} className="mt-1" />
                  <div>
                    <strong className="d-block mb-1">Password updated!</strong>
                    <span className="small">Your password has been successfully reset. You can now log in using your new credentials.</span>
                  </div>
                </div>
              </Alert>
            ) : (
              <Form onSubmit={handleSubmit} noValidate>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold text-secondary mb-1">New Password</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light text-secondary border-end-0"><KeyFill size={14} /></InputGroup.Text>
                    <Form.Control 
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="border-start-0 border-end-0 ps-0 form-control-focus-ring"
                      required
                    />
                    <Button variant="outline-secondary" className="border-start-0 password-toggle-btn" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                    </Button>
                  </InputGroup>
                  <div className="mt-2">
                    <div className="strength-meter">
                      <div className="strength-meter-fill" style={{ width: meterWidth, backgroundColor: meterColor }}></div>
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-1">
                      <span className="small text-muted" style={{ fontSize: '0.75rem' }}>Password Strength:</span>
                      <span className={`small fw-semibold ${strengthClass}`} style={{ fontSize: '0.75rem' }}>{strengthText}</span>
                    </div>
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="small fw-semibold text-secondary mb-1">Confirm New Password</Form.Label>
                  <InputGroup>
                    <InputGroup.Text className="bg-light text-secondary border-end-0"><Check2Circle size={14} /></InputGroup.Text>
                    <Form.Control 
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="border-start-0 border-end-0 ps-0 form-control-focus-ring"
                      required
                    />
                    <Button variant="outline-secondary" className="border-start-0 password-toggle-btn" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeSlash size={16} /> : <Eye size={16} />}
                    </Button>
                  </InputGroup>
                  
                  {confirmPassword.length > 0 && (
                    <div className={`small mt-1 fw-semibold d-flex align-items-center gap-1 ${passwordsMatch ? 'text-success' : 'text-danger'}`}>
                      {passwordsMatch ? <CheckCircleFill size={12} /> : <XCircleFill size={12} />}
                      <span>{passwordsMatch ? 'Passwords match' : 'Passwords do not match'}</span>
                    </div>
                  )}
                </Form.Group>

                <div className="p-3 bg-light rounded-3 mb-4">
                  <span className="d-block small fw-semibold text-secondary mb-2">Password must contain:</span>
                  <ul className="list-unstyled small text-muted mb-0 d-flex flex-column gap-1" style={{ fontSize: '0.8rem' }}>
                    <li className={`d-flex align-items-center gap-2 ${lengthValid ? 'text-dark' : ''}`}>
                      {lengthValid ? <CheckCircleFill className="text-success" /> : <Circle className="text-secondary" />}
                      At least 8 characters long
                    </li>
                    <li className={`d-flex align-items-center gap-2 ${numberValid ? 'text-dark' : ''}`}>
                      {numberValid ? <CheckCircleFill className="text-success" /> : <Circle className="text-secondary" />}
                      At least one number (0-9)
                    </li>
                    <li className={`d-flex align-items-center gap-2 ${specialValid ? 'text-dark' : ''}`}>
                      {specialValid ? <CheckCircleFill className="text-success" /> : <Circle className="text-secondary" />}
                      At least one special character (!@#$%^&*)
                    </li>
                  </ul>
                </div>

                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={isLoading}
                  className="w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                >
                  <span>{isLoading ? 'Resetting...' : 'Reset Password'}</span>
                  {!isLoading && <ShieldCheck size={18} />}
                </Button>
              </Form>
            )}

            <div className="text-center mt-4 pt-2 border-top">
              <Link href="/" className="text-decoration-none small fw-semibold text-primary d-inline-flex align-items-center gap-1">
                <ArrowLeft size={14} />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </div>

        </Col>
      </Row>
    </Container>
  );
}
