import React, { useState, useEffect } from 'react'
import { Card, Stack } from 'react-bootstrap'
import CommonUtils from '@/services/CommonUtils'

function UpcomingAlarmList({alarms}) {
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
    <Card style={{ width: '100%', height: '50vh' }}>
      <Card.Header className="text-center bg-primary text-white">
        <h4>Upcoming Alarms</h4>
      </Card.Header>
      <Stack direction="vertical" gap={0} style={{ overflowY: 'auto', height: '100%' }} className='p-5 align-items-center'>
        {filteredAlarms.length === 0 ? (
          <Card.Body className="text-center">
            <p>No upcoming alarms.</p>
          </Card.Body>
        ) : (
            filteredAlarms.map((alarm) => (
              <Card.Body key={alarm.id} style={{width: '50%', height: '25%'}} className=" d-flex flex-column align-items-center justify-content-center rounded bg-primary bg-opacity-10 border-bottom">
                <div className='text-center' style={{ width: '100%' }}>
                  <strong>{CommonUtils.formatTime(alarm.start_time)} - {CommonUtils.formatTime(alarm.end_time)}</strong> {/* Display start and end time */}
                  <br />
                  {alarm.label || 'No Label'}
                </div>
              </Card.Body>
            ))
        )}
      </Stack>
    </Card>
  )
}

export default UpcomingAlarmList