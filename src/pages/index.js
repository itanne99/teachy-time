import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Alarm, CalendarWeek, Copy } from "react-bootstrap-icons";
import UpcomingAlarmBar from "@/components/UpcomingAlarm/UpcomingAlarmBar";
import UpcomingAlarmList from "@/components/UpcomingAlarm/UpcomingAlarmList";
import CommonUtils from "@/services/CommonUtils";
import Link from "next/link";

export default function App({ useStore }) {
  const user = useStore((state) => state.user);
  const alarms = useStore((state) => state.alarms);
  const currentDay = CommonUtils.getCurrentDay();
  const todayAlarms = alarms[currentDay] || [];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  if (!user) {
    return (
      <Container className="py-5">
        <Row className="justify-content-center text-center mb-5">
          <Col md={10} lg={8}>
            <h1 className="display-3 fw-bold mb-4">Master Your Classroom Time</h1>
            <p className="lead fs-4 text-muted mb-5">
              Teachy Time is the ultimate companion for educators. Manage your daily schedule with precision, visual countdowns, and effortless synchronization.
            </p>
            {/* <div className="d-grid gap-3 d-sm-flex justify-content-sm-center">
              <Link href="/Profile" passHref legacyBehavior>
                <Button variant="primary" size="lg" className="px-5 py-3 fw-bold">
                  Get Started for Free
                </Button>
              </Link>
            </div> */}
          </Col>
        </Row>

        <Row className="g-4 py-5">
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm p-4">
              <Card.Body className="text-center">
                <div className="mb-3 text-primary">
                  <Alarm size={48} />
                </div>
                <h3 className="h4 fw-bold">Visual Countdowns</h3>
                <p className="text-muted">Stay on track with a dynamic progress bar that shows exactly how much time is left in your current session.</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm p-4">
              <Card.Body className="text-center">
                <div className="mb-3 text-success">
                  <CalendarWeek size={48} />
                </div>
                <h3 className="h4 fw-bold">Flexible Scheduling</h3>
                <p className="text-muted">Easily create and manage alarms for every day of the week, tailored to your unique teaching blocks.</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm p-4">
              <Card.Body className="text-center">
                <div className="mb-3 text-info">
                  <Copy size={48} />
                </div>
                <h3 className="h4 fw-bold">One-Click Sync</h3>
                <p className="text-muted">Set up one day and copy it to others in seconds. Save hours of manual entry every week.</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4">
        <Col>
          <h2 className="fw-bold">
            {getGreeting()}, {user.user_metadata?.full_name || "Teacher"}!
          </h2>
          <p className="text-muted">Today is {currentDay}, {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </Col>
      </Row>

      <Row className="g-4 align-items-stretch">
        {/* Main Countdown Section */}
        <Col lg={8} className="d-flex flex-column">
          <Card className="border-0 shadow-sm mb-4 flex-grow-1">
            <Card.Body className="p-0 overflow-hidden rounded d-flex flex-column justify-content-center">
              <UpcomingAlarmBar alarms={todayAlarms} />
            </Card.Body>
          </Card>

          <Row className="g-4 flex-shrink-0">
            <Col md={6}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <h4 className="fw-bold mb-3">View Schedule</h4>
                  <p className="text-muted flex-grow-1">See your full lineup of alarms and transitions for the entire week.</p>
                  <Link href="/ViewAlarms" passHref legacyBehavior>
                    <Button variant="outline-primary" className="mt-3">Open Weekly View</Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="h-100 border-0 shadow-sm">
                <Card.Body className="d-flex flex-column">
                  <h4 className="fw-bold mb-3">Manage Alarms</h4>
                  <p className="text-muted flex-grow-1">Add new alarms, edit existing ones, or sync your schedule across days.</p>
                  <Link href="/EditAlarms" passHref legacyBehavior>
                    <Button variant="outline-primary" className="mt-3">Edit Alarms</Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Sidebar Section */}
        <Col lg={4} className="d-flex">
          <UpcomingAlarmList alarms={todayAlarms} className="h-100" />
        </Col>
      </Row>
    </Container>
  );
}

