import React, { useEffect } from 'react'
import Link from 'next/link'
import { Navbar, Nav, Container, Dropdown, Button } from 'react-bootstrap';
import { useRouter } from 'next/router';
import supabase from '@/supabase/component';
import ProfileDropdown from './ProfileDropdown';
import { PersonCircle, Calendar3, CheckLg } from 'react-bootstrap-icons';

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
        <div className="d-flex align-items-center gap-3">
          {schedules.length > 0 && (
            <Dropdown as={Nav.Item}>
              <Dropdown.Toggle as={Nav.Link} className="d-flex align-items-center gap-2 px-2 py-1 rounded bg-light bg-opacity-10 border border-light border-opacity-25">
                <Calendar3 size={16} />
                <span className="small">{currentSchedule ? currentSchedule.name : 'Select Schedule'}</span>
              </Dropdown.Toggle>
              <Dropdown.Menu align="end" className="shadow-lg border-0" style={{ minWidth: '200px', borderRadius: '8px' }}>
                <div className="px-3 py-2 border-bottom">
                  <small className="text-muted fw-semibold">Active Schedule</small>
                </div>
                {schedules.map((schedule) => (
                  <Dropdown.Item 
                    key={schedule.id} 
                    className="d-flex align-items-center gap-2 py-2"
                    active={schedule.id === currentScheduleId}
                    onClick={() => handleScheduleSelect(schedule.id)}
                  >
                    {schedule.id === currentScheduleId && <CheckLg size={14} />}
                    <span className={schedule.id === currentScheduleId ? 'fw-semibold' : ''}>{schedule.name}</span>
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          )}
          <Dropdown as={Nav.Item}>
            <Dropdown.Toggle as={Nav.Link} style={{padding: 0, margin: 0}}>
              <PersonCircle size={24} />
            </Dropdown.Toggle>
            <Dropdown.Menu align="end" className="shadow-lg border-0" style={{ borderRadius: '8px' }}>
              <Dropdown.Item as={Link} href="/Profile" className="py-2">Profile</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item as={Button} onClick={handleLogout} className="text-danger py-2">Logout</Dropdown.Item>
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
