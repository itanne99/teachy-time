import { useState, useEffect } from "react";
import { Container, Form, Button, Alert, Card, Row, Col } from "react-bootstrap";
import supabase from "@/supabase/component";
import { useRouter } from "next/router";
import { useStore } from "@/services/useStore";
import { UpdatePasswordModal } from "@/components/models/UpdatePassword"; // Import UpdatePasswordModal

const getUserProfileAndSession = async () => {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return { user, session };
};

export default function Profile() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    email: "",
  });
  const [originalProfile, setOriginalProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  // Get password reset state and setter from global store
  const passwordResetFlag = useStore((state) => state.passwordResetFlag);
  const setPasswordResetFlag = useStore((state) => state.setPasswordResetFlag);

  useEffect(() => {
    const fetchSessionAndUser = async () => {
      const { user, session } = await getUserProfileAndSession();
      return { user, session };
    };
    fetchSessionAndUser().then(({ user, session }) => {
      setUser(user);
      setSession(session);
      if (user) {
        fetchUserProfile(user.id);
        setProfile((prev) => ({ ...prev, email: user.email }));
      } else {
        setLoading(false);
      }
    });
  }, []);

  // useEffect to check for 'reset=True' query parameter and set the flag
  useEffect(() => {
    if (router.isReady) {
      const { reset } = router.query;
      if (reset != undefined && (reset === 'true' || reset === 'True')) {
        setPasswordResetFlag(true);
        // setForcedPasswordReset(true); // Removed: setForcedPasswordReset call
      }
    }
  }, [router.isReady, router.query.reset, router, setPasswordResetFlag]); // Added setPasswordResetFlag to dependencies

  // New useEffect to clear the 'reset' query parameter when the modal is closed
  useEffect(() => {
    // This useEffect now only clears the query param if passwordResetFlag is false AND the param exists.
    // It no longer depends on 'forcedPasswordReset'.
    if (router.isReady && !passwordResetFlag && router.query.reset) {
      router.replace(router.pathname, undefined, { shallow: true });
    }
  }, [passwordResetFlag, router.isReady, router.query.reset, router]);

  const fetchUserProfile = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/userProfile?user_id=${userId}`);
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch profile");
      }
      const newProfile = {
        ...profile,
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email || "",
      };
      setProfile(newProfile);
      setOriginalProfile(newProfile);
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setProfile(originalProfile);
    setIsEditing(false);
  };

  const handleEdit = () => {
    setMessage(null);
    setIsEditing(true);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    if (!user) {
      setError("User not authenticated.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/userProfile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,
          first_name: profile.first_name,
          last_name: profile.last_name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setMessage("Profile updated successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container className="py-4">
        <Alert variant="info">Loading profile...</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card>
        <Card.Header>
          <Row className="align-items-center">
            <Col>
              <h5 className="mb-0">Your Profile</h5>
            </Col>
            <Col xs="auto">
              <Button
                variant="primary"
                onClick={handleEdit}
                style={{ visibility: isEditing ? 'hidden' : 'visible' }}
              >
                Edit
              </Button>
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label className="fw-bold">Email address</Form.Label>
              {isEditing ? (
                <Form.Control type="email" value={profile.email} readOnly disabled />
              ) : (
                <span className="form-control-plaintext">{profile.email}</span>
              )}
              <Form.Text className="text-muted">
                Your email cannot be changed here.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formFirstName">
              <Form.Label className="fw-bold">First Name</Form.Label>
              {isEditing ? (
                <Form.Control type="text" name="first_name" value={profile.first_name} onChange={handleChange} />
              ) : (
                <span className="form-control-plaintext">{profile.first_name}</span>
              )}
            </Form.Group>

            <Form.Group className="mb-3" controlId="formLastName">
              <Form.Label className="fw-bold">Last Name</Form.Label>
              {isEditing ? (
                <Form.Control type="text" name="last_name" value={profile.last_name} onChange={handleChange} />
              ) : (
                <span className="form-control-plaintext">{profile.last_name}</span>
              )}
            </Form.Group>

            {isEditing && (
              <Col className="d-flex">
                <Button variant="primary" type="submit" disabled={loading} className="me-2">
                  {loading ? "Saving..." : "Save"}
                </Button>
                <Button variant="light" onClick={handleCancel} disabled={loading}>
                  Cancel
                </Button>
                <Button variant="warning" className="ms-auto" onClick={() => { setPasswordResetFlag(true); }} disabled={loading}>
                  Reset Password
                </Button>
              </Col>
            )}
          </Form>
        </Card.Body>
      </Card>
      
      <UpdatePasswordModal />
    </Container>
  );
}
