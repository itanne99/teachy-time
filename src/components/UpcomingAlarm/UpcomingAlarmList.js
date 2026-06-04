import React, { useState, useEffect } from 'react'
import { Card, Stack, Badge } from 'react-bootstrap'
import CommonUtils from '@/services/CommonUtils'
import { Clock, CalendarX, ArrowRight } from 'react-bootstrap-icons'

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
        .sort((a, b) => a.start_time.localeCompare(b.start_time));
      setFilteredAlarms(upcoming);
    };

    filterAndSortAlarms();
    const interval = setInterval(filterAndSortAlarms, 1 * 1000);

    return () => clearInterval(interval);
  }, [alarms]);

  const getDuration = (alarm) => {
    const [startHour, startMinute] = alarm.start_time.split(':').map(Number);
    const [endHour, endMinute] = alarm.end_time.split(':').map(Number);
    const startMins = startHour * 60 + startMinute;
    let endMins = endHour * 60 + endMinute;
    if (endMins < startMins) endMins += 24 * 60;
    const duration = endMins - startMins;
    const hours = Math.floor(duration / 60);
    const mins = duration % 60;
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  return (
    <Card className={`border-0 shadow-sm d-flex flex-column ${className}`} style={{ width: '100%' }}>
      <Card.Header className="bg-white border-0 py-3 flex-shrink-0">
        <div className="d-flex align-items-center justify-content-between">
          <h5 className="fw-bold mb-0">
            <Clock className="me-2" size={18} />
            Upcoming Today
          </h5>
          <Badge bg="light" text="dark" pill>{filteredAlarms.length}</Badge>
        </div>
      </Card.Header>
      <Stack direction="vertical" gap={2} style={{ overflowY: 'auto' }} className='px-3 pb-3 flex-grow-1'>
        {filteredAlarms.length === 0 ? (
          <Card.Body className="text-center py-5">
            <CalendarX size={48} className="text-muted mb-3" />
            <p className="text-muted mb-0">No more timers for today.</p>
          </Card.Body>
        ) : (
            filteredAlarms.map((alarm, index) => (
              <Card 
                key={alarm.id} 
                className={`border ${index === 0 ? 'border-primary border-2' : 'border-secondary'}`}
                style={{ transition: 'all 200ms ease' }}
              >
                <Card.Body className="py-2 px-3 bg-light">
                  {index === 0 && (
                    <Badge bg="primary" pill className="mb-2" style={{ fontSize: '0.65rem' }}>
                      <ArrowRight size={10} className="me-1" />
                      Next
                    </Badge>
                  )}
                  <div className='d-flex justify-content-between align-items-center'>
                    <div className="fw-bold text-primary">{CommonUtils.formatTime(alarm.start_time)}</div>
                    <div className="d-flex align-items-center gap-2">
                      <Badge bg="light" text="dark" className="small">{getDuration(alarm)}</Badge>
                      <div className="text-muted small">{CommonUtils.formatTime(alarm.end_time)}</div>
                    </div>
                  </div>
                  <div className="fw-semibold mt-1 small">{alarm.label || 'No Label'}</div>
                </Card.Body>
              </Card>
            ))
        )}
      </Stack>
    </Card>
  )
}

export default UpcomingAlarmList
