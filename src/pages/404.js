import Link from 'next/link'
import React, { useEffect } from 'react'
import { Container } from 'react-bootstrap'

function Custom404(props) {

  useEffect(() => {
    console.error(`props:`, props);
  }, [])

  return (
    <Container fluid className="d-flex flex-grow-1 align-items-center justify-content-center">
      <div className="text-center">
        <h1 className="display-1 fw-bold">404</h1>
        <p className="fs-3"> <span className="text-danger">Opps!</span> Page not found.</p>
        <p className="lead">
          The page you’re looking for doesn’t exist.
        </p>
        <Link href="/" className="btn btn-primary">Go Home</Link>
      </div>
    </Container>
  )
}

export default Custom404