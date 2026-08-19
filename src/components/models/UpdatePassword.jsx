import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { useStore } from "@/services/useStore";
import { Key, CheckCircle, XCircle, ShieldLock } from 'react-bootstrap-icons';

export const UpdatePasswordModal = () => {
  const passwordResetFlag = useStore((state) => state.passwordResetFlag);
  const setPasswordResetFlag = useStore((state) => state.setPasswordResetFlag);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (passwordResetFlag) {
      setNewPassword('');
      setConfirmPassword('');
      setError('');
      setSuccessMessage('');
    }
  }, [passwordResetFlag]);

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setError('Password must contain at least one uppercase letter.');
      return;
    }
    if (!/[a-z]/.test(newPassword)) {
      setError('Password must contain at least one lowercase letter.');
      return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setError('Password must contain at least one number.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/passwordRecovery', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update password.');
      }

      setSuccessMessage('Password updated successfully! You can now log in with your new password.');
      setTimeout(() => {
        setPasswordResetFlag(false);
        setNewPassword('');
        setConfirmPassword('');
      }, 3000);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);

  const RequirementCheck = ({ met, label }) => (
    <div className="d-flex align-items-center gap-2 small">
      {met ? <CheckCircle size={14} className="text-success" /> : <XCircle size={14} className="text-muted" />}
      <span className={met ? 'text-success' : 'text-muted'}>{label}</span>
    </div>
  );

  return (
    <Modal show={passwordResetFlag} onHide={() => setPasswordResetFlag(false)} centered enforceFocus={false}>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="d-flex align-items-center gap-2">
          <ShieldLock size={22} className="text-primary" />
          Update Password
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-2">
        {error && <Alert variant="danger" className="d-flex align-items-start gap-2"><span>{error}</span></Alert>}
        {successMessage && <Alert variant="success" className="d-flex align-items-start gap-2"><CheckCircle size={18} className="mt-1 flex-shrink-0" /><span>{successMessage}</span></Alert>}
        <Form onSubmit={handlePasswordUpdate}>
          <Form.Group className="mb-3" controlId="formNewPassword">
            <Form.Label className="small fw-semibold text-muted d-flex align-items-center gap-1">
              <Key size={14} />
              New Password
            </Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </Form.Group>

          {newPassword && (
            <div className="mb-3 p-2 bg-light rounded">
              <div className="small fw-semibold mb-1">Requirements:</div>
              <RequirementCheck met={hasMinLength} label="At least 8 characters" />
              <RequirementCheck met={hasUppercase} label="One uppercase letter" />
              <RequirementCheck met={hasLowercase} label="One lowercase letter" />
              <RequirementCheck met={hasNumber} label="One number" />
            </div>
          )}

          <Form.Group className="mb-3" controlId="formConfirmPassword">
            <Form.Label className="small fw-semibold text-muted d-flex align-items-center gap-1">
              <Key size={14} />
              Confirm Password
            </Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="outline-secondary" onClick={() => setPasswordResetFlag(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isLoading || successMessage}>
              {isLoading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" className="me-2" />
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};
