import React from 'react';
import { Modal, Button } from 'react-bootstrap';

export const ConfirmModal = ({ show, onHide, onConfirm, title, message }) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title || 'Confirm Action'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{message || 'Are you sure you want to proceed?'}</p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Confirm Overwrite
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
