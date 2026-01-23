import React, { useState, useEffect, useMemo } from "react";
import { Container, Row, Col, Button, Tabs, Tab, Table } from "react-bootstrap";
import { useReactTable, getCoreRowModel, getSortedRowModel } from "@tanstack/react-table";
import CommonUtils from "@/services/CommonUtils";
import { AlterAlarm } from "@/components/models/AlterAlarm";
import { ConfirmModal } from "@/components/models/ConfirmModal";

export default function EditAlarms({ useStore }) {
  const [activeDay, setActiveDay] = useState("");
  const alarms = useStore((state) => state.alarms);
  const setAlarms = useStore((state) => state.setAlarms);
  const user = useStore((state) => state.user);
  const [sorting, setSorting] = React.useState([{ id: "start_time", desc: false }]); // Initialize sorting by start_time
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const [showModal, setShowModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingCopy, setPendingCopy] = useState(null); // { fromDay, toDay }
  const [editingAlarm, setEditingAlarm] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [confirmCopy, setConfirmCopy] = useState({}); // State to manage confirmation for copying
  const [loading, setLoading] = useState(false);

  // Set active day to current day on component mount
  useEffect(() => {
    setActiveDay(CommonUtils.getCurrentDay());
  }, []);

  // Fetch alarms when user is available
  useEffect(() => {
    const fetchAlarms = async () => {
      if (user?.id) {
        setLoading(true);
        try {
          const response = await fetch("/api/alarms", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: user.id }),
          });
          const data = await response.json();
          if (response.ok) {
            setAlarms(data);
          } else {
            console.error("Failed to fetch alarms:", data.error);
          }
        } catch (error) {
          console.error("Error fetching alarms:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchAlarms();
  }, [setAlarms]);

  // Function to add a new alarm to the active day
  const handleAddAlarm = () => {
    const newAlarm = {
      start_time: "00:00", // Changed from 'time'
      end_time: "00:00",   // Added new field
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

  // Function to remove an alarm from the active day
  const removeAlarm = async (id) => {
    try {
      const response = await fetch("/api/alarms", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setAlarms({
          ...alarms,
          [activeDay]: alarms[activeDay].filter((alarm) => alarm.id !== id),
        });
      } else {
        const data = await response.json();
        console.error("Failed to delete alarm:", data.error);
      }
    } catch (error) {
      console.error("Error deleting alarm:", error);
    }
  };

  const handleSaveAlarm = async (alarmToSave) => {
    setValidationError(null);
    const isUpdating = !!alarmToSave.id;
    const method = isUpdating ? "PATCH" : "PUT";
    const endpoint = "/api/alarms";

    const body = isUpdating
      ? { id: alarmToSave.id, start_time: alarmToSave.start_time, end_time: alarmToSave.end_time, label: alarmToSave.label } // Updated fields
      : {
          ...alarmToSave,
          user_id: user.id,
          day_of_week: daysOfWeek.indexOf(activeDay),
        };

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
        // Set sorting to re-sort by start_time after save
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
    setLoading(true);
    const alarmsToCopy = alarms[fromDay] || [];
    const toDayIndex = daysOfWeek.indexOf(toDay);

    try {
      // Delete existing alarms on the target day first
      const deleteResponse = await fetch("/api/alarms", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          day_of_week: toDayIndex,
        }),
      });

      if (!deleteResponse.ok) {
        console.error(`Failed to delete existing alarms for ${toDay}`);
        setLoading(false);
        return;
      }

      const copiedAlarms = [];
      for (const alarm of alarmsToCopy) {
        try {
          const response = await fetch("/api/alarms", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              user_id: user.id,
              day_of_week: toDayIndex,
              start_time: alarm.start_time,
              end_time: alarm.end_time,
              label: alarm.label,
            }),
          });
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

  // Function to copy alarms from one day to another
  const handleCopyAlarms = async (fromDay, toDay) => {
    if (confirmCopy[toDay] === "confirm") {
      // Second click: perform the copy
      const targetAlarms = alarms[toDay] || [];
      if (targetAlarms.length > 0) {
        setPendingCopy({ fromDay, toDay });
        setShowConfirmModal(true);
      } else {
        await performCopy(fromDay, toDay);
      }
    } else {
      // First click: ask for confirmation
      setConfirmCopy((prev) => ({ ...prev, [toDay]: "confirm" }));
    }
  };


  // Define columns for TanStack Table
  const columns = useMemo(
    () => [
      {
        accessorKey: "start_time", // Changed from 'time'
        header: "Start Time",      // Changed header
        size: "15%",               // Adjusted size
        sortingFn: "datetime",
        enableSorting: true,
        cell: ({ row }) => <span style={{ fontSize: "2rem" }}>{CommonUtils.formatTime(row.original.start_time)}</span>, // Use start_time
      },
      {
        accessorKey: "end_time",   // Added new column
        header: "End Time",        // Added header
        size: "15%",               // Adjusted size
        sortingFn: "datetime",
        enableSorting: true,
        cell: ({ row }) => <span style={{ fontSize: "2rem" }}>{CommonUtils.formatTime(row.original.end_time)}</span>, // Use end_time
      },
      {
        accessorKey: "label",
        header: "Label",
        size: "55%", // Adjusted size
        cell: ({ row }) => <span style={{ fontSize: "2rem" }}>{row.original.label}</span>,
      },
      {
        id: "actions",
        header: () => <span className="text-end">Actions</span>,
        size: "15%",
        cell: ({ row }) => (
          <div className="text-end">
            <Button variant="info" size="md" className="me-2" onClick={() => handleEditAlarm(row.original)}>
              Edit
            </Button>
            <Button variant="danger" size="md" onClick={() => removeAlarm(row.original.id)}>
              Delete
            </Button>
          </div>
        ),
      },
    ],
    [alarms, activeDay]
  );

  // Prepare table data for TanStack Table
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
      {/* Day selection tabs */}
      <Tabs id="day-tabs" activeKey={activeDay} onSelect={(k) => setActiveDay(k)} className="mb-3 justify-content-center">
        {daysOfWeek.map((day) => (
          <Tab eventKey={day} title={day} key={day} />
        ))}
      </Tabs>

      <Row className="align-items-center mb-3">
        <Col>
          <h2>{activeDay} Timers</h2>
        </Col>
        <Col xs="auto">
          <Button variant="success" onClick={handleAddAlarm}>
            Add Timer
          </Button>
        </Col>
      </Row>

      {/* Alarms table */}
      <Table striped bordered hover responsive className="mb-4" style={{ opacity: loading ? 0.5 : 1 }}>
        <thead>
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
                <td key={cell.id} className={cell.column.id === "actions" ? "text-end" : "justify-content-center"}>
                  {cell.column.columnDef.cell instanceof Function ? cell.column.columnDef.cell({ row }) : cell.getValue()}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Copy alarms functionality */}
      <Row className="align-items-center border-top pt-3">
        <Col>
          <h3>Copy Timers to...</h3>
        </Col>
        <Col xs="auto">
          {daysOfWeek
            .filter((day) => day !== activeDay)
            .map((day) => (
              <Button
                key={day}
                size="sm" // Changed size to 'sm' for consistency
                className="me-2 mb-2"
                onClick={() => handleCopyAlarms(activeDay, day)}
                variant={confirmCopy[day] === "confirm" ? "warning" : confirmCopy[day] === "copied" ? "success" : "dark"}
                disabled={confirmCopy[day] === "copied" || loading}>
                {confirmCopy[day] === "confirm" ? "Confirm?" : confirmCopy[day] === "copied" ? "Copied!" : day}
              </Button>
            ))}
        </Col>
      </Row>
    </Container>
  );
}
