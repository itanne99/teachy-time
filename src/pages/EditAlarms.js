import React, { useState, useEffect, useMemo } from "react"
import { Container, Row, Col, Button, Table, Card, Badge, Modal, Form } from "react-bootstrap"
import { useReactTable, getCoreRowModel, getSortedRowModel } from "@tanstack/react-table"
import CommonUtils from "@/services/CommonUtils"
import { AlterAlarm } from "@/components/models/AlterAlarm"
import { ConfirmModal } from "@/components/models/ConfirmModal"
import { PlusCircle, PencilSquare, Trash2, Copy, Clock, CalendarX, CheckCircle, ExclamationTriangle } from "react-bootstrap-icons"
import { PRESET_WARNING_CHIMES } from "@/config/chimes"
import { DAYS_OF_WEEK, API_ENDPOINTS } from "@/config/constants"

const dayInitials = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function EditAlarms({ useStore }) {
  const [activeDay, setActiveDay] = useState("")
  const alarms = useStore((state) => state.alarms)
  const setAlarms = useStore((state) => state.setAlarms)
  const user = useStore((state) => state.user)
  const currentScheduleId = useStore((state) => state.currentScheduleId)
  const userSounds = useStore((state) => state.userSounds)
  const warningLeadMinutes = useStore((state) => state.warningLeadMinutes)
  const [sorting, setSorting] = React.useState([{ id: "start_time", desc: false }])

  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingCopy, setPendingCopy] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [editingAlarm, setEditingAlarm] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [confirmCopy, setConfirmCopy] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setActiveDay(CommonUtils.getCurrentDay());
  }, []);

  const handleAddAlarm = () => {
    const newAlarm = {
      start_time: "00:00",
      end_time: "00:00",
      label: "New Timer",
    };
    setEditingAlarm(newAlarm);
    setValidationError(null);
    setShowModal(true);
  };

  const handleEditAlarm = (alarm) => {
    setEditingAlarm(alarm);
    setValidationError(null);
    setShowModal(true);
  };

  const requestDelete = (alarm) => {
    setPendingDelete(alarm);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return

    try {
      const response = await fetch(API_ENDPOINTS.ALARMS, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pendingDelete.id }),
      })

      if (response.ok) {
        setAlarms({
          ...alarms,
          [activeDay]: alarms[activeDay].filter((alarm) => alarm.id !== pendingDelete.id),
        });
      } else {
        const data = await response.json();
        console.error("Failed to delete alarm:", data.error);
      }
    } catch (error) {
      console.error("Error deleting alarm:", error);
    } finally {
      setShowDeleteModal(false);
      setPendingDelete(null);
    }
  };

  const handleSaveAlarm = async (alarmToSave) => {
    setValidationError(null)
    const isUpdating = !!alarmToSave.id
    const method = isUpdating ? "PATCH" : "PUT"
    const endpoint = API_ENDPOINTS.ALARMS

    const body = isUpdating
      ? { id: alarmToSave.id, start_time: alarmToSave.start_time, end_time: alarmToSave.end_time, label: alarmToSave.label, play_sound: alarmToSave.play_sound, sound_id: alarmToSave.sound_id, play_warning_sound: alarmToSave.play_warning_sound, warning_sound_id: alarmToSave.warning_sound_id }
      : {
          ...alarmToSave,
          user_id: user.id,
          schedule_id: currentScheduleId,
          day_of_week: DAYS_OF_WEEK.indexOf(activeDay),
          play_sound: alarmToSave.play_sound || false,
          sound_id: alarmToSave.sound_id || null,
          play_warning_sound: alarmToSave.play_warning_sound || false,
          warning_sound_id: alarmToSave.warning_sound_id || null,
        }

    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        if (isUpdating) {
          setAlarms({
            ...alarms,
            [activeDay]: alarms[activeDay].map((a) => (a.id === data.id ? data : a)),
          });
        } else {
          setAlarms({
            ...alarms,
            [activeDay]: [...alarms[activeDay], data],
          });
        }
        table.setSorting([{ id: "start_time", desc: false }]);
        setShowModal(false);
        setEditingAlarm(null);
      } else {
        setValidationError(data.error || "An unexpected error occurred.");
      }
    } catch (error) {
      setValidationError("An unexpected error occurred.");
      console.error(`Error ${isUpdating ? "updating" : "creating"} alarm:`, error);
    }
  };

  const performCopy = async (fromDay, toDay) => {
    setLoading(true)
    const alarmsToCopy = alarms[fromDay] || []
    const toDayIndex = DAYS_OF_WEEK.indexOf(toDay)

    try {
      const deleteResponse = await fetch(API_ENDPOINTS.ALARMS, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          schedule_id: currentScheduleId,
          day_of_week: toDayIndex,
        }),
      })

      if (!deleteResponse.ok) {
        console.error(`Failed to delete existing alarms for ${toDay}`);
        setLoading(false);
        return;
      }

      const copiedAlarms = [];
      for (const alarm of alarmsToCopy) {
        try {
          const response = await fetch(API_ENDPOINTS.ALARMS, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: user.id,
              schedule_id: currentScheduleId,
              day_of_week: toDayIndex,
              start_time: alarm.start_time,
              end_time: alarm.end_time,
              label: alarm.label,
            }),
          })
          const newAlarm = await response.json();
          if (response.ok) {
            copiedAlarms.push(newAlarm);
          }
        } catch (error) {
          console.error(`Error copying alarm ${alarm.label}`, error);
        }
      }

      setAlarms({ ...alarms, [toDay]: copiedAlarms });
    } catch (error) {
      console.error(`Error in copy process:`, error);
    } finally {
      setLoading(false);
      setConfirmCopy((prev) => ({ ...prev, [toDay]: "copied" }));
      setTimeout(() => setConfirmCopy((prev) => ({ ...prev, [toDay]: null })), 3000);
      setShowConfirmModal(false);
      setPendingCopy(null);
    }
  };

  const handleCopyAlarms = async (fromDay, toDay) => {
    if (confirmCopy[toDay] === "confirm") {
      const targetAlarms = alarms[toDay] || [];
      if (targetAlarms.length > 0) {
        setPendingCopy({ fromDay, toDay });
        setShowConfirmModal(true);
      } else {
        await performCopy(fromDay, toDay);
      }
    } else {
      setConfirmCopy((prev) => ({ ...prev, [toDay]: "confirm" }));
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: "start_time",
        header: "Start",
        size: "15%",
        sortingFn: "datetime",
        enableSorting: true,
        cell: ({ row }) => <span className="fw-semibold">{CommonUtils.formatTime(row.original.start_time)}</span>,
      },
      {
        accessorKey: "end_time",
        header: "End",
        size: "15%",
        sortingFn: "datetime",
        enableSorting: true,
        cell: ({ row }) => <span className="fw-semibold">{CommonUtils.formatTime(row.original.end_time)}</span>,
      },
      {
        accessorKey: "label",
        header: "Label",
        size: "40%",
        cell: ({ row }) => <span>{row.original.label}</span>,
      },
      {
        id: "sound",
        header: "Sound",
        size: "18%",
        cell: ({ row }) => {
          const alarm = row.original;
          const hasSounds = userSounds.length > 0;
          return (
            <div className="d-flex align-items-center gap-2">
              <Form.Check
                type="checkbox"
                checked={!!alarm.play_sound}
                disabled={!hasSounds}
                onChange={(e) => {
                  const updated = { ...alarm, play_sound: e.target.checked };
                  setAlarms({
                    ...alarms,
                    [activeDay]: alarms[activeDay].map(a => a.id === alarm.id ? updated : a),
                  });
                }}
                title={!hasSounds ? "Upload sounds in your Profile first" : undefined}
              />
              {alarm.play_sound && hasSounds && (
                <Form.Select
                  size="sm"
                  value={alarm.sound_id || "__default__"}
                  onChange={(e) => {
                    const val = e.target.value === "__default__" ? null : e.target.value;
                    const updated = { ...alarm, sound_id: val };
                    setAlarms({
                      ...alarms,
                      [activeDay]: alarms[activeDay].map(a => a.id === alarm.id ? updated : a),
                    });
                  }}
                >
                  <option value="__default__">Default</option>
                  {userSounds.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </Form.Select>
              )}
            </div>
          );
        },
      },
      {
        id: "warning",
        header: `Warning (${warningLeadMinutes}m)`,
        size: "18%",
        cell: ({ row }) => {
          const alarm = row.original;
          return (
            <div className="d-flex align-items-center gap-2">
              <Form.Check
                type="checkbox"
                checked={!!alarm.play_warning_sound}
                onChange={(e) => {
                  const updated = { ...alarm, play_warning_sound: e.target.checked };
                  setAlarms({
                    ...alarms,
                    [activeDay]: alarms[activeDay].map(a => a.id === alarm.id ? updated : a),
                  });
                }}
              />
              {alarm.play_warning_sound && (
                <Form.Select
                  size="sm"
                  value={alarm.warning_sound_id || "__default__"}
                  onChange={(e) => {
                    const val = e.target.value === "__default__" ? null : e.target.value;
                    const updated = { ...alarm, warning_sound_id: val };
                    setAlarms({
                      ...alarms,
                      [activeDay]: alarms[activeDay].map(a => a.id === alarm.id ? updated : a),
                    });
                  }}
                >
                  <option value="__default__">Default</option>
                  {PRESET_WARNING_CHIMES.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                  {userSounds.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </Form.Select>
              )}
            </div>
          );
        },
      },
      {
        id: "actions",
        header: () => <span className="text-end">Actions</span>,
        size: "12%",
        cell: ({ row }) => (
          <div className="text-end d-flex gap-2 justify-content-end">
            <Button variant="primary" size="sm" onClick={() => handleEditAlarm(row.original)} title="Edit">
              <PencilSquare size={16} />
            </Button>
            <Button variant="danger" size="sm" onClick={() => requestDelete(row.original)} title="Delete">
              <Trash2 size={16} />
            </Button>
          </div>
        ),
      },
    ],
    [alarms, activeDay, setAlarms, userSounds, warningLeadMinutes]
  );

  const table = useReactTable({
    data: alarms[activeDay] || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  });

  const todaysAlarms = alarms[activeDay] || [];

  return (
    <Container className="py-4">
      <AlterAlarm show={showModal} onHide={() => setShowModal(false)} onSave={handleSaveAlarm} alarm={editingAlarm} day={activeDay} validationError={validationError} />
      <ConfirmModal
        show={showConfirmModal}
        onHide={() => {
          setShowConfirmModal(false);
          setConfirmCopy((prev) => ({ ...prev, [pendingCopy?.toDay]: null }));
        }}
        onConfirm={() => performCopy(pendingCopy.fromDay, pendingCopy.toDay)}
        title="Overwrite Timers?"
        message={`Are you sure you want to overwrite the existing timers for ${pendingCopy?.toDay}? This action cannot be undone.`}
      />

      <Modal show={showDeleteModal} onHide={() => { setShowDeleteModal(false); setPendingDelete(null); }} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="d-flex align-items-center gap-2 text-danger">
            <ExclamationTriangle size={22} />
            Delete Timer
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <p className="text-muted">
            Are you sure you want to delete <strong>&quot;{pendingDelete?.label}&quot;</strong>? This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="outline-secondary" onClick={() => { setShowDeleteModal(false); setPendingDelete(null); }} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={loading}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Day selector pills */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="py-3">
          <div className="d-flex align-items-center justify-content-center gap-2 flex-wrap">
            {DAYS_OF_WEEK.map((day, index) => (
              <button
                key={day}
                type="button"
                className={`tt-day-pill ${day === activeDay ? "active" : ""}`}
                onClick={() => setActiveDay(day)}
              >
                {dayInitials[index]}
              </button>
            ))}
          </div>
        </Card.Body>
      </Card>

      {/* Header */}
      <Row className="align-items-center mb-3">
        <Col>
          <div className="d-flex align-items-center gap-2">
            <Clock size={22} className="text-primary" />
            <h2 className="fw-bold mb-0">{activeDay} Timers</h2>
            {todaysAlarms.length > 0 && (
              <Badge bg="light" text="dark" pill>{todaysAlarms.length}</Badge>
            )}
          </div>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={handleAddAlarm}>
            <PlusCircle className="me-2" size={18} />
            Add Timer
          </Button>
        </Col>
      </Row>

      {/* Alarms table or empty state */}
      <Card className="border-0 shadow-sm mb-4">
        {todaysAlarms.length === 0 ? (
          <Card.Body className="text-center py-5">
            <CalendarX size={48} className="text-muted mb-3" />
            <h5 className="fw-bold">No timers for {activeDay}</h5>
            <p className="text-muted mb-4">Click &quot;Add Timer&quot; to create your first timer for this day.</p>
          </Card.Body>
        ) : (
          <Table hover responsive className="mb-0 align-middle" style={{ opacity: loading ? 0.5 : 1 }}>
            <thead className="bg-light">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className={header.column.id === "actions" ? "text-end" : ""} style={header.column.columnDef.size ? { width: header.column.columnDef.size } : {}}>
                      {header.isPlaceholder ? null : header.column.columnDef.header instanceof Function ? header.column.columnDef.header() : header.column.columnDef.header}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className={cell.column.id === "actions" ? "text-end" : ""}>
                      {cell.column.columnDef.cell instanceof Function ? cell.column.columnDef.cell({ row }) : cell.getValue()}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {/* Copy alarms functionality */}
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex align-items-center gap-2 mb-3">
            <Copy size={20} className="text-primary" />
            <h5 className="fw-bold mb-0">Copy Timers to...</h5>
          </div>
          <div className="d-flex flex-wrap gap-2">
            {DAYS_OF_WEEK
              .filter((day) => day !== activeDay)
              .map((day) => (
                <Button
                  key={day}
                  size="sm"
                  onClick={() => handleCopyAlarms(activeDay, day)}
                  variant={confirmCopy[day] === "confirm" ? "warning" : confirmCopy[day] === "copied" ? "success" : "secondary"}
                  disabled={confirmCopy[day] === "copied" || loading}>
                  {confirmCopy[day] === "confirm" ? (
                    <>Confirm {day}?</>
                  ) : confirmCopy[day] === "copied" ? (
                    <>
                      <CheckCircle size={14} className="me-1" />
                      Copied!
                    </>
                  ) : (
                    day
                  )}
                </Button>
              ))}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
