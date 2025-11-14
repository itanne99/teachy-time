import UpcomingAlarmList from "@/components/UpcomingAlarm/UpcomingAlarmList";
import React from "react";
import { Col, Container } from "react-bootstrap";
import CommonUtils from "@/services/CommonUtils";
import UpcomingAlarmBar from "@/components/UpcomingAlarm/UpcomingAlarmBar";

function ViewAlarms({ useStore }) {
  const alarms = useStore((state) => state.alarms);
  const todaysAlarms = alarms[CommonUtils.getCurrentDay()] || [];


  return (
    <Container className="d-flex flex-column flex-grow-1 align-items-center justify-content-center">
      <UpcomingAlarmBar alarms={todaysAlarms} />
      <UpcomingAlarmList alarms={todaysAlarms} />
    </Container>
  );
}

export default ViewAlarms;
