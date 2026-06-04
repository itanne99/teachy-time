import React, { useState, useEffect, useRef } from "react"; // Import useRef
import { ProgressBar } from "react-bootstrap";
import CommonUtils from "@/services/CommonUtils";
import { useStore } from "@/services/useStore";

function UpcomingAlarmBar({ alarms }) {
  const setIsPlaying = useStore((state) => state.setIsPlaying);
  const setAudioSrc = useStore((state) => state.setAudioSrc);
  const defaultChime = "https://mgsqrwnwppjmijenbfys.supabase.co/storage/v1/object/public/chimes/public/wind-chimes-37762.mp3";

  const [currentAlarm, setCurrentAlarm] = useState(null);
  const [nextAlarm, setNextAlarm] = useState(null);
  const [segmentDuration, setSegmentDuration] = useState(0); // Total duration of the current active segment in seconds
  const [timeLeftInCurrentSegment, setTimeLeftInCurrentSegment] = useState(0); // Time left until current segment ends in seconds
  const [timeUntilNextAlarm, setTimeUntilNextAlarm] = useState(0); // Time left until next segment starts in seconds
  const [currentAlarmLabel, setCurrentAlarmLabel] = useState("No timers for today");
  const [progressPercentage, setProgressPercentage] = useState(0); // Single percentage for the bar
  const [barVariant, setBarVariant] = useState("secondary"); // Variant for the single bar
  
  // Tracking the previously active alarm to detect when it ends
  const lastAlarmIdRef = useRef(null);
  const endAlarmTimeoutRef = useRef(null); // Ref to store the timeout ID for current alarm's end

  // Effect 1: Find active and next segments (runs every second and on alarm end)
  useEffect(() => {
    const findActiveAndNextSegments = () => {
      if (endAlarmTimeoutRef.current) {
        clearTimeout(endAlarmTimeoutRef.current);
        endAlarmTimeoutRef.current = null;
      }

      const now = new Date();
      const sortedAlarms = [...alarms].sort((a, b) => a.start_time.localeCompare(b.start_time));

      let activeSegment = null;
      let nextUpcomingSegment = null;

      for (let i = 0; i < sortedAlarms.length; i++) {
        const alarm = sortedAlarms[i];
        const [startHour, startMinute] = alarm.start_time.split(":").map(Number);
        const [endHour, endMinute] = alarm.end_time.split(":").map(Number);

        const segmentStartTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute, 0);
        let segmentEndTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour, endMinute, 0);

        if (segmentEndTime < segmentStartTime) {
          segmentEndTime.setDate(segmentEndTime.getDate() + 1);
        }

        if (now >= segmentStartTime && now < segmentEndTime) {
          activeSegment = alarm;
          nextUpcomingSegment = sortedAlarms[i + 1] || null;
          break;
        } else if (now < segmentStartTime) {
          if (!activeSegment && !nextUpcomingSegment) {
            nextUpcomingSegment = alarm;
          }
          if (!activeSegment && nextUpcomingSegment) {
            break;
          }
        }
      }

      // TRIGGER LOGIC: Play audio when the PREVIOUS alarm ends
      if (lastAlarmIdRef.current && (!activeSegment || activeSegment.id !== lastAlarmIdRef.current)) {
        setAudioSrc(defaultChime);
        setIsPlaying(true);
      }

      // Update state and tracking ref
      setCurrentAlarm(activeSegment);
      setNextAlarm(nextUpcomingSegment);
      lastAlarmIdRef.current = activeSegment ? activeSegment.id : null;

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

        const timeUntilEnd = segmentEndTime.getTime() - now.getTime();
        if (timeUntilEnd > 0) {
          endAlarmTimeoutRef.current = setTimeout(findActiveAndNextSegments, timeUntilEnd + 50);
        }
      } else if (nextUpcomingSegment) {
        setCurrentAlarmLabel(`Upcoming: ${nextUpcomingSegment.label}`);
        setSegmentDuration(0);
      } else {
        if (sortedAlarms.length > 0) {
          const lastAlarmOfDay = sortedAlarms[sortedAlarms.length - 1];
          const [lastEndHour, lastEndMinute] = lastAlarmOfDay.end_time.split(":").map(Number);
          const [lastStartHour, lastStartMinute] = lastAlarmOfDay.start_time.split(":").map(Number);
          let lastAlarmStartTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), lastStartHour, lastStartMinute, 0);
          let lastAlarmEndTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), lastEndHour, lastEndMinute, 0);
          if (lastAlarmEndTime < lastAlarmStartTime) {
              lastAlarmEndTime.setDate(lastAlarmEndTime.getDate() + 1);
          }
          if (now > lastAlarmEndTime) {
            setCurrentAlarmLabel(`After last timer: ${lastAlarmOfDay.label}`);
          } else {
            setCurrentAlarmLabel("No timers for today");
          }
        } else {
          setCurrentAlarmLabel("No timers for today");
        }
        setSegmentDuration(0);
      }
    };

    findActiveAndNextSegments();
    const secondInterval = setInterval(findActiveAndNextSegments, 1000);

    return () => {
      clearInterval(secondInterval);
      if (endAlarmTimeoutRef.current) {
        clearTimeout(endAlarmTimeoutRef.current);
      }
    };
  }, [alarms, setIsPlaying, setAudioSrc]);

  // Effect 2: Countdown and progress bar for current active segment
  useEffect(() => {
    if (!currentAlarm || segmentDuration <= 0) {
      setProgressPercentage(0);
      setBarVariant("secondary");
      setTimeLeftInCurrentSegment(0);
      return;
    }

    const updateCountdownAndProgress = () => {
      const now = new Date();
      const [endHour, endMinute] = currentAlarm.end_time.split(":").map(Number);
      const [startHour, startMinute] = currentAlarm.start_time.split(":").map(Number);

      const segmentStartTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startHour, startMinute, 0);
      let segmentEndTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endHour, endMinute, 0);
      if (segmentEndTime < segmentStartTime) {
          segmentEndTime.setDate(segmentEndTime.getDate() + 1);
      }

      const totalMillisecondsInSegment = (segmentEndTime - segmentStartTime);
      const remainingMilliseconds = (segmentEndTime - now);

      if (remainingMilliseconds <= 0) {
        setTimeLeftInCurrentSegment(0);
        setProgressPercentage(0);
        setBarVariant("secondary");
        return;
      }

      setTimeLeftInCurrentSegment(remainingMilliseconds / 1000);
      const calculatedProgress = (remainingMilliseconds / totalMillisecondsInSegment) * 100;
      setProgressPercentage(Math.min(100, Math.max(0, calculatedProgress)));

      if (remainingMilliseconds <= 60 * 1000) {
        setBarVariant("danger");
      } else if (remainingMilliseconds <= 300 * 1000) {
        setBarVariant("warning");
      } else {
        setBarVariant("success");
      }
    };

    updateCountdownAndProgress();
    const interval = setInterval(updateCountdownAndProgress, 100);
    return () => clearInterval(interval);
  }, [currentAlarm, segmentDuration]);

  // Effect 3: Countdown for time until next alarm
  useEffect(() => {
    if (currentAlarm || !nextAlarm) {
      setTimeUntilNextAlarm(0);
      return;
    }

    const updateTimeUntilNext = () => {
      const now = new Date();
      const [nextStartHour, nextStartMinute] = nextAlarm.start_time.split(":").map(Number);
      const nextAlarmStartTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), nextStartHour, nextStartMinute, 0);
      const remaining = (nextAlarmStartTime - now) / 1000;
      setTimeUntilNextAlarm(Math.max(0, remaining));

      if (remaining <= 0) {
        setTimeUntilNextAlarm(0);
      }
    };

    updateTimeUntilNext();
    const interval = setInterval(updateTimeUntilNext, 1000);
    return () => clearInterval(interval);
  }, [currentAlarm, nextAlarm]);

  const formatTimeLeft = (seconds) => {
    if (seconds <= 0) return "00:00:00";
    const h = Math.floor(seconds / 3600).toString().padStart(2, "0");
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, "0");
    const s = Math.floor(seconds % 60).toString().padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="upcoming-alarm-bar text-center p-4" style={{ width: "100%" }}>
      <h1 className="display-4 fw-bold mb-4">{currentAlarmLabel}</h1>
      <ProgressBar style={{ height: "5rem", transform: "scaleX(-1)", borderRadius: "1rem" }}>
        <ProgressBar animated variant={barVariant} now={progressPercentage} key={1} />
      </ProgressBar>
      <div className="mt-4">
        {currentAlarm ? (
          <>
            <h4 className="text-muted mb-2">{nextAlarm ? `Next: ${nextAlarm.label} (${CommonUtils.formatTime(nextAlarm.start_time)})` : "Final Timer for Today!"}</h4>
            <h2 className="display-1 fw-bold font-monospace">{formatTimeLeft(timeLeftInCurrentSegment)}</h2>
          </>
        ) : (
          <>
            <h4 className="text-muted mb-2">{nextAlarm ? `Next: ${nextAlarm.label} (${CommonUtils.formatTime(nextAlarm.start_time)})` : "No upcoming timers for today."}</h4>
            {nextAlarm && (
                <h2 className="display-1 fw-bold font-monospace">{formatTimeLeft(timeUntilNextAlarm)}</h2>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default UpcomingAlarmBar;
