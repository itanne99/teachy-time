import React, { useState, useEffect } from "react";
import { ProgressBar } from "react-bootstrap";
import CommonUtils from "@/services/CommonUtils";

function UpcomingAlarmBar({ alarms }) {
  const [nextAlarm, setNextAlarm] = useState(null);
  const [prevAlarm, setPrevAlarm] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds

  const [progressSuccess, setProgressSuccess] = useState(0);
  const [progressWarning, setProgressWarning] = useState(0);
  const [progressDanger, setProgressDanger] = useState(0);

  useEffect(() => {
    const findNextAlarm = () => {
      const now = new Date();
      const sortedAlarms = [...alarms].sort((a, b) => a.time.localeCompare(b.time));

      let upcoming = null;
      let previous = null;

      for (const alarm of sortedAlarms) {
        const [alarmHour, alarmMinute] = alarm.time.split(":").map(Number);
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
      setProgressSuccess(0); // Bar is full when no next alarm
      setProgressWarning(0);
      setProgressDanger(0);
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const [alarmHour, alarmMinute] = nextAlarm.time.split(":").map(Number);
      const alarmTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), alarmHour, alarmMinute, 0);

      const totalSeconds = (alarmTime - now) / 1000;
      if (totalSeconds <= 0) {
        setTimeLeft(0);
        // The other useEffect will find the next alarm shortly
      }
      setTimeLeft(totalSeconds);

      // Calculate progress
      const prevAlarmTime = (() => {
        if (!prevAlarm) {
          // If no previous alarm, consider the start of the day (00:00) as the reference
          const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
          return startOfDay.getTime(); // Get timestamp
        }
        const [prevHour, prevMinute] = prevAlarm.time.split(":").map(Number);
        const prev = new Date(now.getFullYear(), now.getMonth(), now.getDate(), prevHour, prevMinute, 0);
        return prev.getTime(); // Get timestamp
      })();

      const totalDuration = (alarmTime.getTime() - prevAlarmTime) / 1000;
      const elapsed = (now.getTime() - prevAlarmTime) / 1000;

      if (totalDuration > 0) {
        const overallProgress = Math.max(0, 100 - (elapsed / totalDuration) * 100);

        if (totalSeconds <= 60) { // Less than 1 minute
          setProgressSuccess(0);
          setProgressWarning(0);
          // Scale the progress from 5% down to 0 over 60 seconds
          setProgressDanger((totalSeconds / 60) * 5);
        } else if (totalSeconds <= 300) { // Less than 5 minutes
          setProgressSuccess(0);
          // Scale the progress from 10% down to 0 over the 240s warning phase
          setProgressWarning(((totalSeconds - 60) / 240) * 10);
          setProgressDanger(5);
        } else {
          setProgressSuccess(overallProgress);
          setProgressWarning(10);
          setProgressDanger(5);
        }
      } else {
        setProgressSuccess(100);
      }
    };

    updateCountdown(); // Initial call
    const interval = setInterval(updateCountdown, 1000); // Update every second
    return () => clearInterval(interval);
  }, [nextAlarm, prevAlarm]);

  const formatTimeLeft = (seconds) => {
    if (seconds <= 0) return "00:00:00";
    const h = Math.floor(seconds / 3600)
      .toString()
      .padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(seconds % 60)
      .toString()
      .padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="upcoming-alarm-bar text-center p-3 bg-light" style={{ width: "100%" }}>
      <h1>{prevAlarm ? `${prevAlarm.label}` : "First alarm of the day"}</h1>
      <ProgressBar style={{ height: "4rem", transform: "rotate(180deg)" }}>
        <ProgressBar animated variant="danger" now={progressDanger} key={1} />
        <ProgressBar animated variant="warning" now={progressWarning} key={2} />
        <ProgressBar animated variant="success" now={progressSuccess} key={3} />
        <ProgressBar now={100 - (progressSuccess + progressWarning + progressDanger)} variant="secondary" key={4} />
      </ProgressBar>

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
