import React, { useEffect } from 'react'
import Link from 'next/link'
import { Navbar, Nav, Container, Dropdown, Button } from 'react-bootstrap';
import { useRouter } from 'next/router';
import supabase from '@/supabase/component';
import ProfileDropdown from './ProfileDropdown';
import { PersonCircle } from 'react-bootstrap-icons';

export const NavBar = ({ useStore }) => {
  const router = useRouter();
  const currentPath = router.asPath;
  const session = useStore((state) => state.session);
  const schedules = useStore((state) => state.schedules);
  const currentScheduleId = useStore((state) => state.currentScheduleId);
  const setCurrentScheduleId = useStore((state) => state.setCurrentScheduleId);

  const currentSchedule = schedules.find(s => s.id === currentScheduleId);

  const pages = [
    { name: 'Home', path: '/', type: 'link' },
    { name: 'View', path: '/ViewAlarms', type: 'link' },
    { name: 'Edit', path: '/EditAlarms', type: 'link' },
    { name: 'Schedules', path: '/Schedules', type: 'link' },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleScheduleSelect = (id) => {
    setCurrentScheduleId(id);
  };

  const displayLoginOrProfile = () => {
    if (session) {
      return (
        <div className="d-flex align-items-center">
          {schedules.length > 0 && (
            <Dropdown as={Nav.Item} className="me-3">
              <Dropdown.Toggle as={Button} variant="outline-light" size="sm">
                {currentSchedule ? currentSchedule.name : 'Select Schedule'}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {schedules.map((schedule) => (
                  <Dropdown.Item 
                    key={schedule.id} 
                    active={schedule.id === currentScheduleId}
                    onClick={() => handleScheduleSelect(schedule.id)}
                  >
                    {schedule.name}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          )}
          <Dropdown as={Nav.Item}>
            <Dropdown.Toggle as={Nav.Link} style={{padding: 0, margin: 0}}>
              <PersonCircle size={24} />
            </Dropdown.Toggle>
            <Dropdown.Menu align="end">
              <Dropdown.Item as={Link} href="/Profile">Profile</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item as={Button} onClick={handleLogout}>Logout</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      );
    } else {
      return <ProfileDropdown useStore={useStore} />;
    }
  }


  return (
    <Navbar expand="lg" className="bg-body-tertiary bg-dark" data-bs-theme="dark">
      <Container>
        <Navbar.Brand as={Link} href="/">Teachy Time</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav activeKey={currentPath} className="w-100 align-items-center">
            {session && pages.map((page) => (
              page.type === 'link' ? (
                <Nav.Link as={Link} href={page.path} key={page.name}>{page.name}</Nav.Link>
              ) : (
                <span key={page.name} className="nav-link" style={{cursor: 'default'}}>{page.name}</span>
              )
            ))}
            <div className='ms-auto'>
              {displayLoginOrProfile()}
            </div>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}
