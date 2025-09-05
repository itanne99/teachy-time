import supabase from '@/db/supabase';
import React, { useState, forwardRef } from 'react';
import { Dropdown, Form, Button, Alert } from 'react-bootstrap';

// Custom Toggle to remove the dropdown arrow
const CustomToggle = forwardRef(({ children, onClick }, ref) => (
  <Button
    ref={ref}
    onClick={(e) => {
      e.preventDefault();
      onClick(e);
    }}
    variant="primary"
  >
    {children}
  </Button>
));

function ProfileDropdown() {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if(!email || !password){
      setError('Please enter both email and password.');
      setIsLoading(false);
      return;
    }
    setError(''); // Reset error on new submission

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_email: email,
          password: password }),
      });

      const data = await response.json();

      if (response.status === 400 && data.code === 'invalid_credentials') {
        setError('Invalid login credentials.');
        return;
      } else if (response.status === 400) {
        setError(data.message || 'An unknown error occurred during login.');
        return;
      } else if (!response.ok) {
        setError(data.message);
        return;
      }

      const setSessionResponse = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token
      });

      if(setSessionResponse.error){
        throw setSessionResponse.error;
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dropdown>
      <Dropdown.Toggle as={CustomToggle} id="dropdown-custom-components">
        Login
      </Dropdown.Toggle>

      <Dropdown.Menu align="end" className="p-3" style={{ minWidth: '250px' }}>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Email address</Form.Label>
            <Form.Control type="email" placeholder="Enter email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <Form.Control type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </Form.Group>
          <div className="d-grid">
            <Button variant="secondary" type="submit" disabled={isLoading}>
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </div>
        </Form>
      </Dropdown.Menu>
    </Dropdown>
  );
}
export default ProfileDropdown;