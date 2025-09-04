import React, { useState, useEffect } from 'react';
import { ProgressBar } from 'react-bootstrap';
import CommonUtils from '@/services/CommonUtils';

function UpcomingAlarmBar({ alarms }) {
  const [nextAlarm, setNextAlarm] = useState(null);
  const [prevAlarm, setPrevAlarm] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [progress, setProgress] = useState(100); // in percentage

  useEffect(() => {
    const findNextAlarm = () => {
      const now = new Date();
      const sortedAlarms = [...alarms].sort((a, b) => a.time.localeCompare(b.time));

      let upcoming = null;
      let previous = null;

      for (const alarm of sortedAlarms) {
        const [alarmHour, alarmMinute] = alarm.time.split(':').map(Number);
        const alarmTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), alarmHour, alarmMinute, 0);

        if (alarmTime > now) {
          if (!upcoming) {
            upcoming = alarm;
          }
        } else {
          previous = alarm;
        }
      }

      if (upcoming) {
        setNextAlarm(upcoming);
        setPrevAlarm(previous);
      } else {
        setNextAlarm(null);
        setPrevAlarm(previous); // Keep the last alarm of the day
      }
    };

    findNextAlarm(); // Initial call

    const interval = setInterval(findNextAlarm, 60 * 1000); // Check for next alarm every minute
    return () => clearInterval(interval);
  }, [alarms]);

  
  useEffect(() => {
    if (!nextAlarm) {
 setProgress(0); // Bar is empty when no next alarm
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const [alarmHour, alarmMinute] = nextAlarm.time.split(':').map(Number);
      const alarmTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), alarmHour, alarmMinute, 0);

      const totalSeconds = (alarmTime - now) / 1000;
      if (totalSeconds <= 0) {
        setTimeLeft(0);
        // The other useEffect will find the next alarm shortly
        return;
      }
      setTimeLeft(totalSeconds);

      // Calculate progress
      const prevAlarmTime = (() => {
        if (!prevAlarm) {
          // If no previous alarm, consider the start of the day (00:00) as the reference
          const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
          return startOfDay.getTime(); // Get timestamp
        }
        const [prevHour, prevMinute] = prevAlarm.time.split(':').map(Number);
        const prev = new Date(now.getFullYear(), now.getMonth(), now.getDate(), prevHour, prevMinute, 0);
        return prev.getTime(); // Get timestamp
      })();

      const totalDuration = (alarmTime.getTime() - prevAlarmTime) / 1000; // Duration from prev to next alarm
      const elapsed = (now.getTime() - prevAlarmTime) / 1000; // Elapsed time since prev alarm

      if (totalDuration > 0) {
        // Calculate progress as a percentage of elapsed time within the current alarm interval
        // The bar should fill from 0% (at prevAlarmTime) to 100% (at nextAlarmTime)
        const currentProgress = (elapsed / totalDuration) * 100; 
        // Ensure progress doesn't exceed 100% or go below 0%
        setProgress(Math.max(0, Math.min(100, currentProgress)));
      } else {
        setProgress(100);
      }
    };

    updateCountdown(); // Initial call
    const interval = setInterval(updateCountdown, 1000); // Update every second
    return () => clearInterval(interval);
  }, [nextAlarm, prevAlarm]);

  const formatTimeLeft = (seconds) => {
    if (seconds <= 0) return '00:00:00';
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="upcoming-alarm-bar text-center p-3 bg-light" style={{ width: '100%' }}>
      <h1>{prevAlarm ? `${prevAlarm.label}` : 'First alarm of the day'}</h1>
      <ProgressBar animated now={progress} style={{height: '4rem'}} />
      <div className="mt-4">
        {nextAlarm ? (
          <>
            <h4>Next: {nextAlarm.label}</h4>
            <h2>{formatTimeLeft(timeLeft)}</h2>
          </>
        ) : (
          <h4>No more alarms for today!</h4>
        )}
      </div>
    </div>
  );
}

export default UpcomingAlarmBar;
