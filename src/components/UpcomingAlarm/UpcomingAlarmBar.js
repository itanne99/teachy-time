import React, { useState, useEffect, useRef } from "react"; // Import useRef
import { ProgressBar } from "react-bootstrap";
import CommonUtils from "@/services/CommonUtils";

function UpcomingAlarmBar({ alarms }) {
  const [currentAlarm, setCurrentAlarm] = useState(null);
  const [nextAlarm, setNextAlarm] = useState(null);
  const [segmentDuration, setSegmentDuration] = useState(0); // Total duration of the current active segment in seconds
  const [timeLeftInCurrentSegment, setTimeLeftInCurrentSegment] = useState(0); // Time left until current segment ends in seconds
  const [timeUntilNextAlarm, setTimeUntilNextAlarm] = useState(0); // Time left until next segment starts in seconds
  const [currentAlarmLabel, setCurrentAlarmLabel] = useState("No alarms for today");
  const [progressPercentage, setProgressPercentage] = useState(0); // Single percentage for the bar
  const [barVariant, setBarVariant] = useState("secondary"); // Variant for the single bar

  const endAlarmTimeoutRef = useRef(null); // Ref to store the timeout ID for current alarm's end

  // Effect 1: Find active and next segments (runs every minute and on alarm end)
  useEffect(() => {
    const findActiveAndNextSegments = () => {
      // Clear any existing end-alarm timeout to prevent multiple triggers
      if (endAlarmTimeoutRef.current) {
        clearTimeout(endAlarmTimeoutRef.current);
        endAlarmTimeoutRef.current = null;
      }

      const now = new Date();
      // Sort alarms by start_time to ensure correct order
      const sortedAlarms = [...alarms].sort((a, b) => a.start_time.localeCompare(b.start_time));

      let activeSegment = null;
      let nextUpcomingSegment = null;

      for (let i = 0; i < sortedAlarms.length; i++) {
        const alarm = sortedAlarms[i];
        const [startHour, startMinute] = alarm.start_time.split(":").map(Number);
        const [endHour, endMinute] = alarm.end_time.split(":").map(Number);

        const segmentStartTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute, 0);
        let segmentEndTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour, endMinute, 0);

        // Adjust end_time if the segment spans midnight
        if (segmentEndTime < segmentStartTime) {
          segmentEndTime.setDate(segmentEndTime.getDate() + 1);
        }

        if (now >= segmentStartTime && now < segmentEndTime) {
          // Found the current active segment
          activeSegment = alarm;
          nextUpcomingSegment = sortedAlarms[i + 1] || null;
          break; // Found active, no need to check further for active
        } else if (now < segmentStartTime) {
          // This alarm is in the future. If no active segment was found yet, this is the first upcoming.
          if (!activeSegment && !nextUpcomingSegment) {
            nextUpcomingSegment = alarm;
          }
          // If we found an upcoming segment, and no active segment, we can stop looking for the *first* upcoming.
          if (!activeSegment && nextUpcomingSegment) {
            break;
          }
        }
      }

      setCurrentAlarm(activeSegment);
      setNextAlarm(nextUpcomingSegment);

      // Update the main label and segment duration
      if (activeSegment) {
        setCurrentAlarmLabel(activeSegment.label);
        const [startHour, startMinute] = activeSegment.start_time.split(":").map(Number);
        const [endHour, endMinute] = activeSegment.end_time.split(":").map(Number);
        const segmentStartTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute, 0);
        let segmentEndTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour, endMinute, 0);
        if (segmentEndTime < segmentStartTime) {
          segmentEndTime.setDate(segmentEndTime.getDate() + 1);
        }
        setSegmentDuration((segmentEndTime - segmentStartTime) / 1000);

        // Set a timeout to re-run this function exactly when the current alarm ends
        const timeUntilEnd = segmentEndTime.getTime() - now.getTime();
        if (timeUntilEnd > 0) {
          // Add a small buffer (e.g., 50ms) to ensure 'now' is definitely past 'segmentEndTime'
          endAlarmTimeoutRef.current = setTimeout(findActiveAndNextSegments, timeUntilEnd + 50);
        }
      } else if (nextUpcomingSegment) {
        setCurrentAlarmLabel(`Upcoming: ${nextUpcomingSegment.label}`);
        setSegmentDuration(0); // No active segment, so no duration for the bar
      } else {
        // No active or upcoming alarms. Check if all alarms have passed for today.
        if (sortedAlarms.length > 0) {
          const lastAlarmOfDay = sortedAlarms[sortedAlarms.length - 1];
          const [lastStartHour, lastStartMinute] = lastAlarmOfDay.start_time.split(":").map(Number);
          const [lastEndHour, lastEndMinute] = lastAlarmOfDay.end_time.split(":").map(Number);
          let lastAlarmStartTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), lastStartHour, lastStartMinute, 0);
          let lastAlarmEndTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), lastEndHour, lastEndMinute, 0);
          if (lastAlarmEndTime < lastAlarmStartTime) {
              lastAlarmEndTime.setDate(lastAlarmEndTime.getDate() + 1);
          }
          if (now > lastAlarmEndTime) {
            setCurrentAlarmLabel(`After last alarm: ${lastAlarmOfDay.label}`);
          } else {
            setCurrentAlarmLabel("No alarms for today"); // Fallback if logic doesn't catch it
          }
        } else {
          setCurrentAlarmLabel("No alarms for today");
        }
        setSegmentDuration(0);
      }
    };

    findActiveAndNextSegments(); // Initial call
    const secondInterval = setInterval(findActiveAndNextSegments, 1 * 1000); // Check for next alarm every minute

    return () => {
      clearInterval(secondInterval);
      if (endAlarmTimeoutRef.current) {
        clearTimeout(endAlarmTimeoutRef.current); // Clear timeout on unmount
      }
    };
  }, [alarms]); // Dependencies: alarms

  // Effect 2: Countdown and progress bar for current active segment (runs every second)
  useEffect(() => {
    if (!currentAlarm || segmentDuration <= 0) {
      setProgressPercentage(0);
      setBarVariant("secondary");
      setTimeLeftInCurrentSegment(0);
      return;
    }

    const updateCountdownAndProgress = () => {
      const now = new Date();
      const [startHour, startMinute] = currentAlarm.start_time.split(":").map(Number);
      const [endHour, endMinute] = currentAlarm.end_time.split(":").map(Number);

      const segmentStartTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute, 0);
      let segmentEndTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour, endMinute, 0);
      if (segmentEndTime < segmentStartTime) {
          segmentEndTime.setDate(segmentEndTime.getDate() + 1);
      }

      // Calculate durations in milliseconds for higher precision
      const totalMillisecondsInSegment = (segmentEndTime - segmentStartTime);
      const remainingMilliseconds = (segmentEndTime - now);

      if (remainingMilliseconds <= 0) {
        setTimeLeftInCurrentSegment(0);
        setProgressPercentage(0); // Bar should be empty when segment ends
        setBarVariant("secondary"); // Or a final color
        // Let Effect 1 handle finding the next alarm when this segment ends
        return;
      }

      // Update timeLeftInCurrentSegment in seconds for display
      setTimeLeftInCurrentSegment(remainingMilliseconds / 1000);

      // Calculate progress percentage based on remaining time (in milliseconds)
      const calculatedProgress = (remainingMilliseconds / totalMillisecondsInSegment) * 100;
      setProgressPercentage(Math.min(100, Math.max(0, calculatedProgress))); // Ensure it's between 0 and 100

      // Determine bar variant based on remaining time (in milliseconds)
      if (remainingMilliseconds <= 60 * 1000) { // Less than 1 minute (60,000 ms)
        setBarVariant("danger");
      } else if (remainingMilliseconds <= 300 * 1000) { // Less than 5 minutes (300,000 ms)
        setBarVariant("warning");
      } else {
        setBarVariant("success"); // More than 5 minutes
      }
    };

    updateCountdownAndProgress(); // Initial call
    const interval = setInterval(updateCountdownAndProgress, 100); // Update every 100 milliseconds for smoother progress
    return () => clearInterval(interval);
  }, [currentAlarm, segmentDuration]); // Dependencies: currentAlarm and its total duration

  // Effect 3: Countdown for time until next alarm (runs every second, only if no current alarm)
  useEffect(() => {
    if (currentAlarm || !nextAlarm) {
      setTimeUntilNextAlarm(0); // Reset if there's an active alarm or no next alarm
      return;
    }

    const updateTimeUntilNext = () => {
      const now = new Date();
      const [nextStartHour, nextStartMinute] = nextAlarm.start_time.split(":").map(Number);
      const nextAlarmStartTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), nextStartHour, nextStartMinute, 0);
      const remaining = (nextAlarmStartTime - now) / 1000; // Keep in seconds for this countdown
      setTimeUntilNextAlarm(Math.max(0, remaining));

      if (remaining <= 0) {
        // Time has come, let Effect 1 find the new active segment
        setTimeUntilNextAlarm(0);
      }

      setProgressSuccess(success);
      setProgressWarning(warning);
      setProgressDanger(danger);

      // schedule next frame
      rafId = requestAnimationFrame(updateCountdown);
    };

    updateTimeUntilNext(); // Initial call
    const interval = setInterval(updateTimeUntilNext, 1000); // This countdown can remain at 1 second
    return () => clearInterval(interval);
  }, [currentAlarm, nextAlarm]); // Dependencies: currentAlarm (to know if we should run) and nextAlarm

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
      <h1>{currentAlarmLabel}</h1>
      <ProgressBar style={{ height: "4rem", transform: "scaleX(-1)" }}>
        <ProgressBar animated variant={barVariant} now={progressPercentage} key={1} />
      </ProgressBar>
      <div className="mt-4">
        {currentAlarm ? (
          <>
            <h4>{nextAlarm ? `Next: ${nextAlarm.label} (${CommonUtils.formatTime(nextAlarm.start_time)})` : "Final Alarm for Today!"}</h4>
            <h2>{formatTimeLeft(timeLeftInCurrentSegment)}</h2>
          </>
        ) : (
          // No current active alarm
          <>
            <h4>{nextAlarm ? `Next: ${nextAlarm.label} (${CommonUtils.formatTime(nextAlarm.start_time)})` : "No upcoming alarms for today."}</h4>
            {nextAlarm && (
                <h2>{formatTimeLeft(timeUntilNextAlarm)}</h2>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default UpcomingAlarmBar;
