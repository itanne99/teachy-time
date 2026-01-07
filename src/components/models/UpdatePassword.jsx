import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Col } from 'react-bootstrap';
import { useStore } from "@/services/useStore"; // Import useStore

export const UpdatePasswordModal = () => { // Removed forcedPasswordReset, setForcedPasswordReset props
  const passwordResetFlag = useStore((state) => state.passwordResetFlag);
  const setPasswordResetFlag = useStore((state) => state.setPasswordResetFlag);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (passwordResetFlag) {
      // Reset form fields and messages when modal opens
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
    if (newPassword.length < 6) { // Basic password length validation
      setError('Password must be at least 6 characters long.');
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
      // Automatically close modal after a short delay
      setTimeout(() => {
        setPasswordResetFlag(false);
        setNewPassword('');
        setConfirmPassword('');
        // setForcedPasswordReset(false); // Removed: setForcedPasswordReset call
      }, 3000);
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      show={passwordResetFlag}
      onHide={() => setPasswordResetFlag(false)}
      centered
    >
      <Modal.Header closeButton> {/* Always show close button */}
        <Modal.Title>Update Password</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {successMessage && <Alert variant="success">{successMessage}</Alert>}
        <Form onSubmit={handlePasswordUpdate}>
          <Form.Group className="mb-3" controlId="formNewPassword">
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formConfirmPassword">
            <Form.Label>Confirm New Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </Form.Group>
          <Col className="d-flex justify-content-end">
            <Button variant="primary" type="submit" disabled={isLoading || successMessage}>
              {isLoading ? 'Updating...' : 'Update Password'}
            </Button>
          </Col>
        </Form>
      </Modal.Body>
      {/* <Modal.Footer className={'d-block'}>
        <Button variant="secondary" onClick={() => setPasswordResetFlag(false)} disabled={isLoading}>
          Close
        </Button>
      </Modal.Footer> */}
    </Modal>
  );
};
