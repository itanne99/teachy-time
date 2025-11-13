import React, { useState, useEffect } from "react";
import { ProgressBar } from "react-bootstrap";
import CommonUtils from "@/services/CommonUtils";

function UpcomingAlarmBar({ alarms }) {
  const [currentAlarm, setCurrentAlarm] = useState(null);
  const [nextAlarm, setNextAlarm] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [currentAlarmLabel, setCurrentAlarmLabel] = useState("No alarms for today");
  const [progressSuccess, setProgressSuccess] = useState(0);
  const [progressWarning, setProgressWarning] = useState(0);
  const [progressDanger, setProgressDanger] = useState(0);

  useEffect(() => {
    const findNextAlarm = () => {
      const now = new Date();
      const sortedAlarms = [...alarms].sort((a, b) => a.time.localeCompare(b.time));

      const upcomingAlarms = sortedAlarms.filter(alarm => {
        const [alarmHour, alarmMinute] = alarm.time.split(":").map(Number);
        const alarmTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), alarmHour, alarmMinute, 0);
        return alarmTime > now;
      });

      const firstUpcoming = upcomingAlarms[0] || null;
      const secondUpcoming = upcomingAlarms[1] || null;

      setCurrentAlarm(firstUpcoming);
      setNextAlarm(secondUpcoming);

      // Update the main label
      if (firstUpcoming) {
        // Find the alarm that just passed to set the label
        const passedAlarms = sortedAlarms.filter(alarm => {
          const [alarmHour, alarmMinute] = alarm.time.split(":").map(Number);
          const alarmTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), alarmHour, alarmMinute, 0);
          return alarmTime <= now;
        });
        // The label should be the last alarm that passed
        const lastPassed = passedAlarms[passedAlarms.length - 1];
        if (lastPassed) {
          setCurrentAlarmLabel(lastPassed.label);
        } else {
          // If no alarm has passed, we are before the first alarm of the day
          setCurrentAlarmLabel("First alarm of the day");
        }
      } else {
        // After the last alarm has passed
        const lastAlarmOfDay = sortedAlarms[sortedAlarms.length - 1];
        setCurrentAlarmLabel(lastAlarmOfDay ? lastAlarmOfDay.label : "No alarms for today");
      }
    };

    findNextAlarm(); // Initial call
    const interval = setInterval(findNextAlarm, 60 * 1000); // Check for next alarm every minute
    return () => clearInterval(interval);
  }, [alarms]);

  useEffect(() => {
    if (!currentAlarm) {
      setProgressSuccess(0); // Bar is full when no next alarm
      setProgressWarning(0);
      setProgressDanger(0);
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const [currentHour, currentMinute] = currentAlarm.time.split(":").map(Number);
      const alarmTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), currentHour, currentMinute, 0);

      const totalSeconds = (alarmTime - now) / 1000;
      if (totalSeconds <= 0) {
        setTimeLeft(0);
        // The other useEffect will find the next alarm shortly
      }
      setTimeLeft(totalSeconds);

      // Calculate progress
      const prevAlarmTime = (() => {
        const sortedAlarms = [...alarms].sort((a, b) => a.time.localeCompare(b.time));
        const passedAlarms = sortedAlarms.filter(alarm => {
          const [h, m] = alarm.time.split(':').map(Number);
          const t = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0);
          return t <= now;
        });
        const lastPassed = passedAlarms[passedAlarms.length - 1];
        if (lastPassed) {
          const [h, m] = lastPassed.time.split(':').map(Number);
          return new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0).getTime();
        }
        return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0).getTime(); // Start of day
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
  }, [currentAlarm, alarms]);

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
      <h1>{currentAlarm?.label}</h1>
      <ProgressBar style={{ height: "4rem", transform: "rotate(180deg)" }}>
        <ProgressBar animated variant="danger" now={progressDanger} key={1} />
        <ProgressBar animated variant="warning" now={progressWarning} key={2} />
        <ProgressBar animated variant="success" now={progressSuccess} key={3} />
        <ProgressBar now={100 - (progressSuccess + progressWarning + progressDanger)} variant="secondary" key={4} />
      </ProgressBar>
      <div className="mt-4">
        {currentAlarm ? (
          <>
            <h4>{nextAlarm ? `Next: ${nextAlarm.label}` : "Final Alarm!"}</h4>
            <h2>{formatTimeLeft(timeLeft)}</h2>
          </>
        ) : (
          <h4>Final Alarm!</h4>
        )}
      </div>
    </div>
  );
}

export default UpcomingAlarmBar;
