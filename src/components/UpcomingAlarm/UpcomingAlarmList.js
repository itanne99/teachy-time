import React, { useState, useEffect } from 'react'
import { Card, Stack } from 'react-bootstrap'
import CommonUtils from '@/services/CommonUtils'

function UpcomingAlarmList({alarms, className}) {
  const [filteredAlarms, setFilteredAlarms] = useState([]);

  useEffect(() => {
    const filterAndSortAlarms = () => {
      const now = new Date();

      const upcoming = alarms
        .filter(alarm => {
          const [startHour, startMinute] = alarm.start_time.split(':').map(Number);

          const alarmStartTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute, 0);
          return now < alarmStartTime;
        })
        .sort((a, b) => {
          // Sort by start_time
          return a.start_time.localeCompare(b.start_time);
        });
      setFilteredAlarms(upcoming);
    };

    filterAndSortAlarms(); // Initial filter and sort
    const interval = setInterval(filterAndSortAlarms, 1 * 1000); // Re-filter every 1 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, [alarms]);

  return (
    <Card className={`border-0 shadow-sm d-flex flex-column ${className}`} style={{ width: '100%' }}>
      <Card.Header className="bg-white border-0 py-3 flex-shrink-0">
        <h4 className="fw-bold mb-0">Upcoming Today</h4>
      </Card.Header>
      <Stack direction="vertical" gap={2} style={{ overflowY: 'auto' }} className='px-3 pb-3 flex-grow-1'>
        {filteredAlarms.length === 0 ? (
          <Card.Body className="text-center py-5">
            <p className="text-muted">No more alarms for today.</p>
          </Card.Body>
        ) : (
            filteredAlarms.map((alarm) => (
              <Card key={alarm.id} className="border-0 bg-primary bg-opacity-10">
                <Card.Body className="py-2 px-3">
                  <div className='d-flex justify-content-between align-items-center'>
                    <div className="fw-bold text-primary">{CommonUtils.formatTime(alarm.start_time)}</div>
                    <div className="text-muted small">{CommonUtils.formatTime(alarm.end_time)}</div>
                  </div>
                  <div className="fw-semibold mt-1">{alarm.label || 'No Label'}</div>
                </Card.Body>
              </Card>
            ))
        )}
      </Stack>
    </Card>
  )
}

export default UpcomingAlarmList