import React, { useState, useEffect, useMemo } from 'react'
import { Container, Row, Col, Button, Tabs, Tab, Form, Table } from 'react-bootstrap';
import { useReactTable, getCoreRowModel, getSortedRowModel } from '@tanstack/react-table';
import CommonUtils from '@/services/CommonUtils';
import { AlterAlarm } from '@/components/models/AlterAlarm';

export default function EditAlarms() {
  const [activeDay, setActiveDay] = useState('Monday');
  const [alarms, setAlarms] = useState(() => {return {}});
  const [sorting, setSorting] = React.useState([])
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const [showModal, setShowModal] = useState(false);
  const [editingAlarm, setEditingAlarm] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [confirmCopy, setConfirmCopy] = useState({}); // State to manage confirmation for copying

  // Initialize alarms for each day of the week
  useEffect(() => {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const initialAlarms = daysOfWeek.reduce((acc, day) => {
      acc[day] = [];
      return acc;
    }, {});
    setAlarms(initialAlarms);
  }, []);

  // Update Alarms state with Session State
  useEffect(() => {
    console.log('Alarms updated:', alarms);
  }, [alarms]);

  // Function to add a new alarm to the active day
  const handleAddAlarm = () => {
    const newAlarm = {
      time: '00:00',
      label: 'New Alarm',
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
  const removeAlarm = (id) => {
    setAlarms(prevAlarms => ({
      ...prevAlarms,
      [activeDay]: prevAlarms[activeDay].filter(alarm => alarm.id !== id),
    }));
  };

  const handleSaveAlarm = (alarmToSave) => {
    const existingAlarm = alarms[activeDay].find(
      (a) => a.time === alarmToSave.time && a.id !== alarmToSave.id
    );

    if (existingAlarm) {
      setValidationError('An alarm at this time already exists.');
      return;
    }

    if (alarmToSave.id) {
      // Update existing alarm
      setAlarms(prev => ({
        ...prev,
        [activeDay]: prev[activeDay].map(a => a.id === alarmToSave.id ? alarmToSave : a)
      }));
    } else {
      // Add new alarm
      const newAlarm = { ...alarmToSave, id: Date.now() };
      setAlarms(prev => ({
        ...prev,
        [activeDay]: [...prev[activeDay], newAlarm]
      }));
    }

    setShowModal(false);
    setEditingAlarm(null);
    setValidationError(null);
  };

  // Function to copy alarms from one day to another
  const handleCopyAlarms = (fromDay, toDay) => {
    if (confirmCopy[toDay] === 'confirm') {
      // Second click: perform the copy
      copyAlarms(fromDay, toDay);
      setConfirmCopy(prev => ({ ...prev, [toDay]: 'copied' }));
      setTimeout(() => {
        setConfirmCopy(prev => ({ ...prev, [toDay]: null }));
      }, 3000); // Revert after 3 seconds
    } else {
      // First click: ask for confirmation
      setConfirmCopy(prev => ({ ...prev, [toDay]: 'confirm' }));
    }
  };

  // Actual copy logic
  const copyAlarms = (fromDay, toDay) => { // Renamed to be internal
    setAlarms(prevAlarms => ({
      ...prevAlarms,
      [toDay]: [...prevAlarms[fromDay]],
    }));
  };

  // Define columns for TanStack Table
  const columns = useMemo(() =>[
    {
      accessorKey: 'time',
      header: 'Time',
      size: '20%',
      sortingFn: 'datetime',
      enableSorting: true,
      cell: ({ row }) => (
        <span style={{ fontSize: '2rem' }}>{CommonUtils.formatTime(row.original.time)}</span>
      ),
    },
    {
      accessorKey: 'label',
      header: 'Label',
      size: '65%',
      cell: ({ row }) => <span style={{ fontSize: '2rem' }}>{row.original.label}</span>,
    },
    {
      id: 'actions',
      header: () => <span className="text-end">Actions</span>,
      size: '15%',
      cell: ({ row }) => (
        <div className="text-end">
          <Button
            variant="info"
            size="md"
            className="me-2"
            onClick={() => handleEditAlarm(row.original)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="md"
            onClick={() => removeAlarm(row.original.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ], [alarms, activeDay]);

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
      <AlterAlarm
        show={showModal}
        onHide={() => setShowModal(false)}
        onSave={handleSaveAlarm}
        alarm={editingAlarm}
        day={activeDay}
        validationError={validationError}
      />
        {/* Day selection tabs */}
      <Tabs
        id="day-tabs"
        activeKey={activeDay}
        onSelect={(k) => setActiveDay(k)}
        className="mb-3 justify-content-center"
      >
        {daysOfWeek.map((day) => (
          <Tab eventKey={day} title={day} key={day} />
        ))}
      </Tabs>

      <Row className="align-items-center mb-3">
        <Col>
          <h2>{activeDay} Alarms</h2>
        </Col>
        <Col xs="auto">
          <Button variant="success" onClick={handleAddAlarm}>
            Add Alarm
          </Button>
        </Col>
      </Row>

        {/* Alarms table */}
      <Table striped bordered hover responsive className="mb-4">
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} className={header.column.id === 'actions' ? 'text-end' : ''}   style={header.column.columnDef.size ? { width: header.column.columnDef.size } : {}}>
                  {header.isPlaceholder ? null : header.column.columnDef.header instanceof Function ? header.column.columnDef.header() : header.column.columnDef.header}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className={cell.column.id === 'actions' ? 'text-end' : 'justify-content-center'}>
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
          <h3>Copy Alarms to...</h3>
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
                variant={
                  confirmCopy[day] === 'confirm'
                    ? 'warning'
                    : confirmCopy[day] === 'copied'
                    ? 'success'
                    : 'dark'
                }
                disabled={confirmCopy[day] === 'copied'}
              >
                {confirmCopy[day] === 'confirm' ? 'Confirm?' : confirmCopy[day] === 'copied' ? 'Copied!' : day}

              </Button>
            ))}
        </Col>
      </Row>
    </Container>
  );
}
