import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { ExclamationTriangle } from 'react-bootstrap-icons';

export const ConfirmModal = ({ show, onHide, onConfirm, title, message }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="d-flex align-items-center gap-2 text-danger">
          <ExclamationTriangle size={22} />
          {title || 'Confirm Action'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-2">
        <p className="text-muted">{message || 'Are you sure you want to proceed?'}</p>
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <Button variant="outline-secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Confirm Overwrite
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
