import { useState, useEffect } from "react";
import { Container, Table, Button, Form, Modal, Alert, Card } from "react-bootstrap";
import { useStore } from "@/services/useStore";
import { PlusCircle, PencilSquare, Trash } from "react-bootstrap-icons";

export default function Schedules() {
  const session = useStore((state) => state.session);
  const schedules = useStore((state) => state.schedules);
  const setSchedules = useStore((state) => state.setSchedules);
  const currentScheduleId = useStore((state) => state.currentScheduleId);
  const setCurrentScheduleId = useStore((state) => state.setCurrentScheduleId);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" or "edit"
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [scheduleName, setScheduleName] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchSchedules = async () => {
    if (!session) return;
    try {
      const response = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: session.user.id }),
      });
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

      const response = await fetch("/api/schedules", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

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

  const handleDelete = async (id, name) => {
    if (name.toLowerCase() === "main") {
      alert("You cannot delete the Main schedule.");
      return;
    }

    if (!confirm(`Are you sure you want to delete the schedule "${name}"? All associated alarms will be lost.`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/schedules", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete schedule");
      }

      if (currentScheduleId === id) {
        // If deleting the current schedule, switch back to Main
        const main = schedules.find(s => s.name.toLowerCase() === "main");
        if (main) setCurrentScheduleId(main.id);
      }

      await fetchSchedules();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">My Schedules</h5>
          <Button variant="primary" size="sm" onClick={handleShowAdd}>
            <PlusCircle className="me-2" /> Add Schedule
          </Button>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Table responsive hover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((schedule) => (
                <tr key={schedule.id} className={schedule.id === currentScheduleId ? "table-primary" : ""}>
                  <td className="align-middle">
                    {schedule.name}
                    {schedule.name.toLowerCase() === "main" && (
                      <span className="badge bg-info ms-2">Default</span>
                    )}
                  </td>
                  <td className="align-middle">
                    {schedule.id === currentScheduleId ? "Active" : ""}
                  </td>
                  <td className="text-end">
                    <Button 
                      variant="outline-secondary" 
                      size="sm" 
                      className="me-2"
                      onClick={() => handleShowEdit(schedule)}
                    >
                      <PencilSquare />
                    </Button>
                    {schedule.name.toLowerCase() !== "main" && (
                      <Button 
                        variant="outline-danger" 
                        size="sm"
                        onClick={() => handleDelete(schedule.id, schedule.name)}
                      >
                        <Trash />
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{modalMode === "add" ? "Add New Schedule" : "Rename Schedule"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Schedule Name</Form.Label>
            <Form.Control 
              type="text" 
              value={scheduleName} 
              onChange={(e) => setScheduleName(e.target.value)}
              placeholder="e.g., Summer Term, Work, etc."
              autoFocus
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
