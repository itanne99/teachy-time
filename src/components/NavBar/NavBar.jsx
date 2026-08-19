import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Navbar, Nav, Container, Dropdown, Button } from 'react-bootstrap';
import { useRouter } from 'next/router';
import supabase from '@/supabase/component';
import ProfileDropdown from './ProfileDropdown';
import { LoginForm } from './LoginForm';
import { PersonCircle, Calendar3, CheckLg } from 'react-bootstrap-icons';

export const NavBar = ({ useStore }) => {
  const router = useRouter();
  const currentPath = router.asPath;
  const session = useStore((state) => state.session);
  const schedules = useStore((state) => state.schedules);
  const currentScheduleId = useStore((state) => state.currentScheduleId);
  const setCurrentScheduleId = useStore((state) => state.setCurrentScheduleId);
  const forceLoginOpen = useStore((state) => state.forceLoginOpen);
  const setForceLoginOpen = useStore((state) => state.setForceLoginOpen);
  const authModalOpen = useStore((state) => state.authModalOpen);
  const setAuthModalOpen = useStore((state) => state.setAuthModalOpen);
  const setAuthModalView = useStore((state) => state.setAuthModalView);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Sync mobile modal state with global forceLoginOpen state only on mobile viewport (< 992px)
  useEffect(() => {
    if (forceLoginOpen && typeof globalThis.window !== 'undefined' && globalThis.window.innerWidth < 992) {
      setShowLoginModal(true);
    }
  }, [forceLoginOpen]);

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

  const mobileNavItems = () => {
    if (!session) return null;

    return (
      <div className="d-lg-none mt-3 pt-3 border-top border-secondary border-opacity-25">
        {schedules.length > 0 && (
          <div className="mb-2">
            <Dropdown>
              <Dropdown.Toggle as={Button} variant="outline-light" size="sm" className="w-100 d-flex align-items-center justify-content-between">
                <span className="d-flex align-items-center gap-2">
                  <Calendar3 size={16} />
                  {currentSchedule ? currentSchedule.name : 'Select Schedule'}
                </span>
              </Dropdown.Toggle>
              <Dropdown.Menu className="w-100 shadow-lg border-0" style={{ borderRadius: '8px' }}>
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
          </div>
        )}
        <div className="d-grid gap-2">
          <Button variant="outline-light" as={Link} href="/Profile" className="text-start">
            <PersonCircle className="me-2" size={18} />
            Profile
          </Button>
          <Button variant="outline-danger" onClick={handleLogout} className="text-start">
            Logout
          </Button>
        </div>
      </div>
    );
  };

  const desktopLoginOrProfile = () => {
    if (session) {
      return (
        <div className="d-none d-lg-flex align-items-center gap-3">
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
  };

  return (
    <Navbar expand="lg" className="bg-body-tertiary bg-dark" data-bs-theme="dark">
      <Container>
        <Navbar.Brand as={Link} href="/">Teachy Time</Navbar.Brand>
        
        {session ? (
          <>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav activeKey={currentPath} className="w-100 align-items-center flex-column flex-lg-row">
                <div className="w-100 d-flex align-items-center flex-column flex-lg-row">
                  {pages.map((page) => (
                    page.type === 'link' ? (
                      <Nav.Link as={Link} href={page.path} key={page.name}>{page.name}</Nav.Link>
                    ) : (
                      <span key={page.name} className="nav-link" style={{cursor: 'default'}}>{page.name}</span>
                    )
                  ))}
                  <div className='ms-auto d-none d-lg-block'>
                    {desktopLoginOrProfile()}
                  </div>
                </div>
                {mobileNavItems()}
              </Nav>
            </Navbar.Collapse>
          </>
        ) : (
          <div className="ms-auto d-flex align-items-center">
            {/* Mobile login button (visible on mobile < lg) */}
            <Button 
              variant="outline-light" 
              className="d-lg-none d-flex align-items-center gap-2 px-3 border-custom-dark" 
              onClick={() => {
                setAuthModalView('login');
                setShowLoginModal(true);
              }}
            >
              <PersonCircle size={18} />
              <span>Sign In</span>
            </Button>

            {/* Desktop dropdown (visible on desktop >= lg) */}
            <div className="d-none d-lg-block">
              <ProfileDropdown useStore={useStore} />
            </div>
          </div>
        )}
      </Container>

      <LoginForm 
        show={showLoginModal || authModalOpen} 
        onHide={() => {
          setShowLoginModal(false);
          setAuthModalOpen(false);
          setForceLoginOpen(false);
        }} 
        useStore={useStore} 
      />
    </Navbar>
  )
}
