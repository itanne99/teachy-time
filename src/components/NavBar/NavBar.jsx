import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { Navbar, Nav, Container, Dropdown, Button } from 'react-bootstrap';
import { useRouter } from 'next/router';
import supabase from '@/supabase/component';
import ProfileDropdown from './ProfileDropdown';
import { PersonCircle } from 'react-bootstrap-icons';

export const NavBar = ({ useStore }) => {
  const router = useRouter();
  const currentPath = router.asPath;
  const [session, setSession] = useState(null);

  useEffect(() => {
    console.log(`Current path:`, currentPath);
  }, [currentPath]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const pages = [
    { name: 'Home', path: '/', type: 'link' },
    { name: 'View', path: '/ViewAlarms', type: 'link' },
    { name: 'Edit', path: '/EditAlarms', type: 'link' },
  ]

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const displayLoginOrProfile = () => {
    if (session) {
      return (
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
