import Link from 'next/link'
import React from 'react'
import { Container, Button } from 'react-bootstrap'
import { ExclamationTriangle, HouseDoor, Clock } from 'react-bootstrap-icons'

function Custom404() {
  return (
    <Container fluid className="d-flex flex-grow-1 align-items-center justify-content-center">
      <div className="text-center" style={{ maxWidth: '500px' }}>
        <span className="d-inline-flex align-items-center justify-content-center bg-danger bg-opacity-10 rounded-circle mb-4" style={{ width: '80px', height: '80px' }}>
          <ExclamationTriangle size={40} className="text-danger" />
        </span>
        <h1 className="display-1 fw-bold text-danger">404</h1>
        <h3 className="fw-bold mb-3">Oops! Page not found</h3>
        <p className="text-muted mb-4">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="d-flex gap-3 justify-content-center">
          <Link href="/" passHref legacyBehavior>
            <Button variant="primary">
              <HouseDoor className="me-2" size={16} />
              Go Home
            </Button>
          </Link>
          <Link href="/ViewAlarms" passHref legacyBehavior>
            <Button variant="outline-secondary">
              <Clock className="me-2" size={16} />
              View Timers
            </Button>
          </Link>
        </div>
      </div>
    </Container>
  )
}

export default Custom404
