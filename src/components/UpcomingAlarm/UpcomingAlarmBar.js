import React, { useState, useEffect, useRef } from "react";
import { ProgressBar, Badge } from "react-bootstrap";
import CommonUtils from "@/services/CommonUtils";
import { useStore } from "@/services/useStore";
import { Clock, HourglassSplit, CheckCircle } from "react-bootstrap-icons";

function UpcomingAlarmBar({ alarms }) {
  const setIsPlaying = useStore((state) => state.setIsPlaying);
  const setAudioSrc = useStore((state) => state.setAudioSrc);
  const defaultChime = "https://mgsqrwnwppjmijenbfys.supabase.co/storage/v1/object/public/chimes/public/wind-chimes-37762.mp3";

  const [currentAlarm, setCurrentAlarm] = useState(null);
  const [nextAlarm, setNextAlarm] = useState(null);
  const [segmentDuration, setSegmentDuration] = useState(0);
  const [timeLeftInCurrentSegment, setTimeLeftInCurrentSegment] = useState(0);
  const [timeUntilNextAlarm, setTimeUntilNextAlarm] = useState(0);
  const [currentAlarmLabel, setCurrentAlarmLabel] = useState("No timers for today");
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [barVariant, setBarVariant] = useState("secondary");
  const [statusLabel, setStatusLabel] = useState("");

  const lastAlarmIdRef = useRef(null);
  const endAlarmTimeoutRef = useRef(null);

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

      if (lastAlarmIdRef.current && (!activeSegment || activeSegment.id !== lastAlarmIdRef.current)) {
        setAudioSrc(defaultChime);
        setIsPlaying(true);
      }

      setCurrentAlarm(activeSegment);
      setNextAlarm(nextUpcomingSegment);
      lastAlarmIdRef.current = activeSegment ? activeSegment.id : null;

      if (activeSegment) {
        setCurrentAlarmLabel(activeSegment.label);
        setStatusLabel("Active");
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
        setStatusLabel("Waiting");
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
            setCurrentAlarmLabel(`Day Complete`);
            setStatusLabel("Complete");
          } else {
            setCurrentAlarmLabel("No timers for today");
            setStatusLabel("");
          }
        } else {
          setCurrentAlarmLabel("No timers for today");
          setStatusLabel("");
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

  const getStatusBadge = () => {
    if (!statusLabel) return null;
    const variantMap = {
      Active: "success",
      Waiting: "warning",
      Complete: "secondary",
    };
    const iconMap = {
      Active: <HourglassSplit size={14} className="me-1 tt-pulse" />,
      Waiting: <Clock size={14} className="me-1" />,
      Complete: <CheckCircle size={14} className="me-1" />,
    };
    return (
      <Badge bg={variantMap[statusLabel]} pill className="px-3 py-2 fs-6">
        {iconMap[statusLabel]}
        {statusLabel}
      </Badge>
    );
  };

  const getHeaderGradient = () => {
    if (currentAlarm) return "linear-gradient(135deg, #02b875 0%, #029e65 100%)";
    if (statusLabel === "Complete") return "linear-gradient(135deg, #6c757d 0%, #495057 100%)";
    return "linear-gradient(135deg, #4582ec 0%, #3469c7 100%)";
  };

  return (
    <div className="upcoming-alarm-bar w-100">
      <div className="text-white p-4 pb-3" style={{ background: getHeaderGradient(), borderRadius: "var(--tt-radius-lg) var(--tt-radius-lg) 0 0" }}>
        <div className="d-flex align-items-center justify-content-between mb-2">
          <h5 className="mb-0 fw-semibold opacity-75">
            {currentAlarm ? <HourglassSplit className="me-2" size={20} /> : <Clock className="me-2" size={20} />}
            Timer Status
          </h5>
          {getStatusBadge()}
        </div>
        <h2 className="fw-bold mb-0">{currentAlarmLabel}</h2>
      </div>

      <div className="bg-white p-4 pt-0" style={{ borderRadius: "0 0 var(--tt-radius-lg) var(--tt-radius-lg)", border: "1px solid rgba(0,0,0,0.06)", borderTop: "none" }}>
        <ProgressBar style={{ height: "1.5rem", transform: "scaleX(-1)", borderRadius: "var(--tt-radius-md)" }} className="mb-3">
          <ProgressBar animated variant={barVariant} now={progressPercentage} key={1} />
        </ProgressBar>

        <div className="text-center">
          {currentAlarm ? (
            <>
              <div className="text-muted mb-2 small">
                {nextAlarm ? `Next: ${nextAlarm.label} at ${CommonUtils.formatTime(nextAlarm.start_time)}` : "Final timer for today"}
              </div>
              <div className="display-4 fw-bold tt-countdown text-dark">{formatTimeLeft(timeLeftInCurrentSegment)}</div>
            </>
          ) : (
            <>
              <div className="text-muted mb-2 small">
                {nextAlarm ? `Starts at ${CommonUtils.formatTime(nextAlarm.start_time)}` : "No upcoming timers"}
              </div>
              {nextAlarm && (
                <div className="display-4 fw-bold tt-countdown text-dark">{formatTimeLeft(timeUntilNextAlarm)}</div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default UpcomingAlarmBar;
