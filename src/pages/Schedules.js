import { useState } from "react"
import { Container, Table, Button, Form, Modal, Alert, Card, Badge } from "react-bootstrap"
import { useAuthStore } from "@/services/stores/useAuthStore"
import { useScheduleStore } from "@/services/stores/useScheduleStore"
import { useConfigStore } from "@/services/stores/useConfigStore"
import { PlusCircle, PencilSquare, Trash2, Calendar3, CheckCircle, CalendarX, ExclamationTriangle } from "react-bootstrap-icons"
import { API_ENDPOINTS } from "@/config/constants"

export default function Schedules() {
  const session = useAuthStore((state) => state.session)
  const schedules = useScheduleStore((state) => state.schedules)
  const setSchedules = useScheduleStore((state) => state.setSchedules)
  const currentScheduleId = useScheduleStore((state) => state.currentScheduleId)
  const setCurrentScheduleId = useScheduleStore((state) => state.setCurrentScheduleId)
  const maxScheduleNameLength = useConfigStore((state) => state.maxScheduleNameLength)

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [scheduleName, setScheduleName] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  const fetchSchedules = async () => {
    if (!session) return;
    try {
      const response = await fetch(API_ENDPOINTS.SCHEDULES, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: session.user.id }),
      })
      const data = await response.json();
      if (response.ok) {
        setSchedules(data);
      }
    } catch (err) {
      console.error("Failed to fetch schedules:", err);
    }
  };

  const handleShowAdd = () => {
    setModalMode("add");
    setScheduleName("");
    setShowModal(true);
  };

  const handleShowEdit = (schedule) => {
    setModalMode("edit");
    setSelectedSchedule(schedule);
    setScheduleName(schedule.name);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!scheduleName.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const method = modalMode === "add" ? "PUT" : "PATCH";
      const body = modalMode === "add" 
        ? { user_id: session.user.id, name: scheduleName }
        : { id: selectedSchedule.id, name: scheduleName };

      const response = await fetch(API_ENDPOINTS.SCHEDULES, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save schedule");
      }

      await fetchSchedules();
      setShowModal(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const requestDelete = (id, name) => {
    if (name.toLowerCase() === "main") {
      setError("You cannot delete the Main schedule.");
      return;
    }
    setPendingDelete({ id, name });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;

    setLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.SCHEDULES, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pendingDelete.id }),
      })

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete schedule");
      }

      if (currentScheduleId === pendingDelete.id) {
        const main = schedules.find(s => s.name.toLowerCase() === "main");
        if (main) setCurrentScheduleId(main.id);
      }

      await fetchSchedules();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setPendingDelete(null);
    }
  };

  return (
    <Container className="py-4">
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center py-3">
          <div className="d-flex align-items-center gap-2">
            <Calendar3 size={22} className="text-primary" />
            <h5 className="fw-bold mb-0">My Schedules</h5>
          </div>
          <Button variant="primary" size="sm" onClick={handleShowAdd}>
            <PlusCircle className="me-2" size={16} />
            Add Schedule
          </Button>
        </Card.Header>
        <Card.Body className="p-0">
          {error && <Alert variant="danger" className="m-3 mb-0">{error}</Alert>}
          {schedules.length === 0 ? (
            <div className="text-center py-5">
              <CalendarX size={48} className="text-muted mb-3" />
              <h5 className="fw-bold">No schedules yet</h5>
              <p className="text-muted mb-4">Create your first schedule to get started.</p>
            </div>
          ) : (
            <Table responsive hover className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th style={{ width: "40%" }}>Name</th>
                  <th style={{ width: "20%" }}>Status</th>
                  <th className="text-end" style={{ width: "40%" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((schedule) => (
                  <tr key={schedule.id} style={schedule.id === currentScheduleId ? { backgroundColor: "var(--bs-primary-bg-subtle)" } : {}}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        {schedule.id === currentScheduleId && <CheckCircle size={16} className="text-success flex-shrink-0" />}
                        <span className="fw-semibold">{schedule.name}</span>
                        {schedule.name.toLowerCase() === "main" && (
                          <Badge bg="info">Default</Badge>
                        )}
                      </div>
                    </td>
                    <td>
                      {schedule.id === currentScheduleId ? (
                        <Badge bg="success" pill>Active</Badge>
                      ) : (
                        <Badge bg="light" text="dark" pill>Inactive</Badge>
                      )}
                    </td>
                    <td className="text-end">
                      <div className="d-flex gap-2 justify-content-end">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleShowEdit(schedule)}
                          title="Rename"
                        >
                          <PencilSquare size={16} />
                        </Button>
                        {schedule.name.toLowerCase() !== "main" && (
                          <Button 
                            variant="outline-danger" 
                            size="sm"
                            onClick={() => requestDelete(schedule.id, schedule.name)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered enforceFocus={false}>
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2">
            <Calendar3 size={20} />
            {modalMode === "add" ? "Add New Schedule" : "Rename Schedule"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label className="fw-semibold">Schedule Name</Form.Label>
            <Form.Control 
              type="text" 
              value={scheduleName} 
              onChange={(e) => setScheduleName(e.target.value)}
              placeholder="e.g., Summer Term, Work, etc."
              maxLength={maxScheduleNameLength}
              autoFocus
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showDeleteModal} onHide={() => { setShowDeleteModal(false); setPendingDelete(null); }} centered enforceFocus={false}>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="d-flex align-items-center gap-2 text-danger">
            <ExclamationTriangle size={22} />
            Delete Schedule
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <p className="text-muted">
            Are you sure you want to delete <strong>&quot;{pendingDelete?.name}&quot;</strong>? All associated alarms will be lost.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="outline-secondary" onClick={() => { setShowDeleteModal(false); setPendingDelete(null); }} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
