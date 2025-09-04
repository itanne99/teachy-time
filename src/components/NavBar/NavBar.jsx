import React, { useEffect } from 'react'
import Link from 'next/link'
import { Navbar, Nav, Container } from 'react-bootstrap';
import { PersonCircle } from 'react-bootstrap-icons';
import { useRouter } from 'next/router';


export const NavBar = () => {
  const router = useRouter();
  const currentPath = router.asPath;

  useEffect(() => {
    console.log(`Current path:`, currentPath);
  }, [currentPath]);

  const pages = [
    { name: 'Home', path: '/', type: 'link' },
    { name: 'About', path: '/about', type: 'link' },
    { name: 'Edit', path: '/EditAlarms', type: 'link' },
  ]


  return (
    <Navbar expand="lg" className="bg-body-tertiary bg-dark" data-bs-theme="dark">
      <Container>
        <Navbar.Brand as={Link} href="/">Teachy Time</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav activeKey={currentPath} className="w-100"> {/* Use w-100 to make Nav take full width */}
            <div className="d-flex align-items-center"> {/* Container for left-aligned items */}
              {pages.map((page) => (
                (() => {
                  switch (page?.type) {
                    case 'link':
                      return (<Nav.Link as={Link} href={page.path} key={page.name}>{page.name}</Nav.Link>);
                    default:
                      return (<span key={page.name}>{page.name}</span>);
                  }
                })()
              ))}
            </div>
            <Nav.Link className='ms-auto'><PersonCircle size={24}/></Nav.Link> {/* Profile icon remains right-aligned */}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
