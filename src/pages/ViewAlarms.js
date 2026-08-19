import UpcomingAlarmList from "@/components/UpcomingAlarm/UpcomingAlarmList";
import React from "react";
import { Col, Container, Row, Card, Button } from "react-bootstrap";
import CommonUtils from "@/services/CommonUtils";
import UpcomingAlarmBar from "@/components/UpcomingAlarm/UpcomingAlarmBar";
import { Calendar3, PencilSquare, Clock } from "react-bootstrap-icons";
import Link from "next/link";
import { useAlarmStore } from "@/services/stores/useAlarmStore";

function ViewAlarms() {
  const alarms = useAlarmStore((state) => state.alarms);
  const currentDay = CommonUtils.getCurrentDay();
  const todaysAlarms = alarms[currentDay] || [];


  return (
    <Container className="py-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <div className="d-flex align-items-center gap-3">
            <span className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle" style={{ width: "48px", height: "48px" }}>
              <Clock size={24} className="text-primary" />
            </span>
            <div>
              <h2 className="fw-bold mb-0">Today&apos;s Schedule</h2>
              <p className="text-muted mb-0">{currentDay}, {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="g-4">
        <Col lg={8}>
          <UpcomingAlarmBar alarms={todaysAlarms} />
        </Col>
        <Col lg={4}>
          <UpcomingAlarmList alarms={todaysAlarms} className="h-100" />
        </Col>
      </Row>

      {todaysAlarms.length === 0 && (
        <Card className="border-0 shadow-sm mt-4">
          <Card.Body className="text-center py-5">
            <Calendar3 size={48} className="text-muted mb-3" />
            <h5 className="fw-bold">No timers set for today</h5>
            <p className="text-muted mb-4">Set up your schedule to see countdowns and stay on track.</p>
            <Link href="/EditAlarms" passHref legacyBehavior>
              <Button variant="primary">
                <PencilSquare className="me-2" />
                Set Up Timers
              </Button>
            </Link>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}

export default ViewAlarms;
