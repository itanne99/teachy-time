import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Alarm, CalendarWeek, Copy, Calendar3, PencilSquare, ArrowRight, PersonCircle } from "react-bootstrap-icons";
import UpcomingAlarmBar from "@/components/UpcomingAlarm/UpcomingAlarmBar";
import UpcomingAlarmList from "@/components/UpcomingAlarm/UpcomingAlarmList";
import CommonUtils from "@/services/CommonUtils";
import Link from "next/link";
import { useAuthStore } from "@/services/stores/useAuthStore";
import { useAlarmStore } from "@/services/stores/useAlarmStore";

export default function App() {
  const user = useAuthStore((state) => state.user);
  const alarms = useAlarmStore((state) => state.alarms);
  const setAuthModalOpen = useAuthStore((state) => state.setAuthModalOpen);
  const setAuthModalView = useAuthStore((state) => state.setAuthModalView);
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
            <div className="mb-4">
              <span className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle" style={{ width: "80px", height: "80px" }}>
                <Alarm size={40} className="text-primary" />
              </span>
            </div>
            <h1 className="display-4 fw-bold mb-4">Master Your Classroom Time</h1>
            <p className="lead fs-5 text-muted mb-5">
              Teachy Time is the ultimate companion for educators. Manage your daily schedule with precision, visual countdowns, and effortless synchronization.
            </p>
            <div className="d-grid gap-3 d-sm-flex justify-content-sm-center">
              <Button 
                variant="primary" 
                size="lg" 
                className="px-5 py-3 fw-semibold"
                onClick={() => {
                  setAuthModalView('signup');
                  setAuthModalOpen(true);
                }}
              >
                Get Started Free <ArrowRight className="ms-2" size={18} />
              </Button>
            </div>
          </Col>
        </Row>

        <Row className="g-4 py-4">
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm p-4 tt-card-clickable">
              <Card.Body className="text-center">
                <div className="mb-3 d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle" style={{ width: "64px", height: "64px" }}>
                  <Alarm size={28} className="text-primary" />
                </div>
                <h3 className="h5 fw-bold">Visual Countdowns</h3>
                <p className="text-muted mb-0">Stay on track with a dynamic progress bar that shows exactly how much time is left in your current session.</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm p-4 tt-card-clickable">
              <Card.Body className="text-center">
                <div className="mb-3 d-inline-flex align-items-center justify-content-center bg-success bg-opacity-10 rounded-circle" style={{ width: "64px", height: "64px" }}>
                  <CalendarWeek size={28} className="text-success" />
                </div>
                 <h3 className="h5 fw-bold">Flexible Scheduling</h3>
                <p className="text-muted mb-0">Easily create and manage timers for every day of the week, tailored to your unique teaching blocks.</p>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="h-100 border-0 shadow-sm p-4 tt-card-clickable">
              <Card.Body className="text-center">
                <div className="mb-3 d-inline-flex align-items-center justify-content-center bg-info bg-opacity-10 rounded-circle" style={{ width: "64px", height: "64px" }}>
                  <Copy size={28} className="text-info" />
                </div>
                <h3 className="h5 fw-bold">One-Click Sync</h3>
                <p className="text-muted mb-0">Set up one day and copy it to others in seconds. Save hours of manual entry every week.</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <div className="d-flex align-items-center gap-3">
            <span className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle" style={{ width: "48px", height: "48px" }}>
              <PersonCircle size={28} className="text-primary" />
            </span>
            <div>
              <h2 className="fw-bold mb-0">
                {getGreeting()}, {user.user_metadata?.full_name || "Teacher"}!
              </h2>
              <p className="text-muted mb-0">Today is {currentDay}, {new Date().toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</p>
            </div>
          </div>
        </Col>
      </Row>

      <Row className="g-4 align-items-stretch">
        {/* Main Countdown Section */}
        <Col lg={8} className="d-flex flex-column">
          <div className="mb-4">
            <UpcomingAlarmBar alarms={todayAlarms} />
          </div>

          <Row className="g-4 flex-shrink-0">
            <Col md={6}>
              <Card className="h-100 border-0 shadow-sm tt-card-clickable">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle" style={{ width: "40px", height: "40px" }}>
                      <Calendar3 size={20} className="text-primary" />
                    </span>
                    <h4 className="fw-bold mb-0">View Schedule</h4>
                  </div>
                  <p className="text-muted flex-grow-1">See your full lineup of timers and transitions for the entire week.</p>
                  <Link href="/ViewAlarms" passHref legacyBehavior>
                    <Button variant="primary" className="mt-3">
                      Open Weekly View <ArrowRight size={16} className="ms-1" />
                    </Button>
                  </Link>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="h-100 border-0 shadow-sm tt-card-clickable">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle" style={{ width: "40px", height: "40px" }}>
                      <PencilSquare size={20} className="text-primary" />
                    </span>
                    <h4 className="fw-bold mb-0">Manage Timers</h4>
                  </div>
                  <p className="text-muted flex-grow-1">Add new timers, edit existing ones, or sync your schedule across days.</p>
                  <Link href="/EditAlarms" passHref legacyBehavior>
                    <Button variant="primary" className="mt-3">
                      Edit Timers <ArrowRight size={16} className="ms-1" />
                    </Button>
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

