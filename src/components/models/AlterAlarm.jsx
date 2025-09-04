import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

export const AlterAlarm = ({ show, onHide, onSave, alarm, day, validationError }) => {
  const [currentAlarm, setCurrentAlarm] = useState(alarm);

  useEffect(() => {
    setCurrentAlarm(alarm);
  }, [alarm]);

  const handleChange = (field, value) => {
    setCurrentAlarm(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(currentAlarm);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{currentAlarm?.id ? 'Edit Alarm' : 'Add Alarm'} for {day}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {validationError && <Alert variant="danger">{validationError}</Alert>}
        <Form>
          <Form.Group className="mb-3" controlId="formAlarmTime">
            <Form.Label>Time</Form.Label>
            <Form.Control
              type="time"
              value={currentAlarm?.time || ''}
              onChange={(e) => handleChange('time', e.target.value)}
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="formAlarmLabel">
            <Form.Label>Label</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter alarm label"
              value={currentAlarm?.label || ''}
              onChange={(e) => handleChange('label', e.target.value)}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
