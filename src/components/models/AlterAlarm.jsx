import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import { Clock, Tag, ExclamationTriangle, MusicNoteBeamed, VolumeUp, Bell } from 'react-bootstrap-icons';
import { useStore } from '@/services/useStore';
import { PRESET_CHIMES, PRESET_WARNING_CHIMES } from '@/config/chimes';

export const AlterAlarm = ({ show, onHide, onSave, alarm, day, validationError }) => {
  const [currentAlarm, setCurrentAlarm] = useState(alarm)
  const [isLoading, setIsLoading] = useState(false)
  const userSounds = useStore((state) => state.userSounds)
  const defaultSound = useStore((state) => state.defaultSound)
  const warningLeadMinutes = useStore((state) => state.warningLeadMinutes)
  const maxLabelLength = useStore((state) => state.maxLabelLength)

  useEffect(() => {
    setCurrentAlarm(alarm);
  }, [alarm]);

  const handleChange = (field, value) => {
    setCurrentAlarm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    if (e) {
      e.preventDefault();
    }
    setIsLoading(true);
    await onSave(currentAlarm);
    setIsLoading(false);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="md">
      <Modal.Header closeButton>
        <Modal.Title className="d-flex align-items-center gap-2">
          <Clock size={20} />
          {currentAlarm?.id ? 'Edit Timer' : 'Add Timer'}
          <span className="text-muted fw-normal fs-6">— {day}</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {validationError && (
          <Alert variant="danger" className="d-flex align-items-start gap-2">
            <ExclamationTriangle size={18} className="mt-1 flex-shrink-0" />
            <span>{validationError}</span>
          </Alert>
        )}
        <Form onSubmit={(e) => { handleSave(e); }}>
          <div className="row g-3">
            <div className="col-6">
              <Form.Group controlId="formAlarmStartTime">
                <Form.Label className="small fw-semibold text-muted">
                  <Clock size={14} className="me-1" />
                  Start Time
                </Form.Label>
                <Form.Control
                  type="time"
                  value={currentAlarm?.start_time || ''}
                  onChange={(e) => handleChange('start_time', e.target.value)}
                />
              </Form.Group>
            </div>
            <div className="col-6">
              <Form.Group controlId="formAlarmEndTime">
                <Form.Label className="small fw-semibold text-muted">
                  <Clock size={14} className="me-1" />
                  End Time
                </Form.Label>
                <Form.Control
                  type="time"
                  value={currentAlarm?.end_time || ''}
                  onChange={(e) => handleChange('end_time', e.target.value)}
                />
              </Form.Group>
            </div>
          </div>
          <Form.Group className="mt-3" controlId="formAlarmLabel">
            <Form.Label className="small fw-semibold text-muted">
              <Tag size={14} className="me-1" />
              Label
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g., Math Lesson, Recess, Lunch"
              value={currentAlarm?.label || ''}
              onChange={(e) => handleChange('label', e.target.value)}
              maxLength={maxLabelLength}
            />
          </Form.Group>

          <Form.Group className="mt-3" controlId="formAlarmSound">
            <Form.Label className="small fw-semibold text-muted">
              <MusicNoteBeamed size={14} className="me-1" />
              Play Sound
            </Form.Label>
            <div className="d-flex align-items-center gap-2">
              <Form.Check
                type="checkbox"
                label="Enable sound"
                checked={!!currentAlarm?.play_sound}
                disabled={userSounds.length === 0}
                onChange={(e) => handleChange('play_sound', e.target.checked)}
                title={userSounds.length === 0 ? "Upload sounds in your Profile first" : undefined}
              />
            </div>
            {currentAlarm?.play_sound && userSounds.length > 0 && (
              <Form.Select
                className="mt-2"
                value={currentAlarm?.sound_id || "__default__"}
                onChange={(e) => {
                  const val = e.target.value === "__default__" ? null : e.target.value;
                  handleChange('sound_id', val);
                }}
              >
                <option value="__default__">Default ({defaultSound ? "custom" : "wind chimes"})</option>
                {userSounds.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Form.Select>
            )}
            {userSounds.length === 0 && (
              <Form.Text className="text-muted">Upload sounds in your Profile to enable alarm sounds.</Form.Text>
            )}
          </Form.Group>

          <Form.Group className="mt-3 pt-3 border-top" controlId="formAlarmWarningSound">
            <Form.Label className="small fw-semibold text-muted">
              <Bell size={14} className="me-1" />
              Warning Chime ({warningLeadMinutes} min before end)
            </Form.Label>
            <div className="d-flex align-items-center gap-2">
              <Form.Check
                type="checkbox"
                label="Enable warning chime"
                checked={!!currentAlarm?.play_warning_sound}
                onChange={(e) => handleChange('play_warning_sound', e.target.checked)}
              />
            </div>
            {currentAlarm?.play_warning_sound && (
              <Form.Select
                className="mt-2"
                value={currentAlarm?.warning_sound_id || "__default__"}
                onChange={(e) => {
                  const val = e.target.value === "__default__" ? null : e.target.value;
                  handleChange('warning_sound_id', val);
                }}
              >
                <option value="__default__">Default warning</option>
                {PRESET_WARNING_CHIMES.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
                {userSounds.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </Form.Select>
            )}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <Spinner as="span" animation="border" size="sm" className="me-2" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
