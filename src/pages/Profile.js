import { useState, useEffect } from "react";
import { Container, Form, Button, Alert, Card, Row, Col, Spinner } from "react-bootstrap";
import supabase from "@/supabase/component";
import { useRouter } from "next/router";
import { useStore } from "@/services/useStore";
import { UpdatePasswordModal } from "@/components/models/UpdatePassword";
import { PersonCircle, Envelope, Key, PencilSquare, CheckCircle } from "react-bootstrap-icons";

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

  useEffect(() => {
    if (router.isReady) {
      const { reset } = router.query;
      if (reset != undefined && (reset === 'true' || reset === 'True')) {
        setPasswordResetFlag(true);
      }
    }
  }, [router.isReady, router.query.reset, router, setPasswordResetFlag]);

  useEffect(() => {
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
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p className="text-muted mb-0">Loading profile...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-0 py-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <span className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle" style={{ width: "48px", height: "48px" }}>
                <PersonCircle size={28} className="text-primary" />
              </span>
              <div>
                <h5 className="fw-bold mb-0">Your Profile</h5>
                <p className="text-muted small mb-0">Manage your account details</p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleEdit}
              style={{ visibility: isEditing ? 'hidden' : 'visible' }}
            >
              <PencilSquare className="me-1" size={14} />
              Edit
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger" className="d-flex align-items-start gap-2"><span>{error}</span></Alert>}
          {message && <Alert variant="success" className="d-flex align-items-start gap-2"><CheckCircle size={18} className="mt-1 flex-shrink-0" /><span>{message}</span></Alert>}
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label className="small fw-semibold text-muted d-flex align-items-center gap-1">
                <Envelope size={14} />
                Email address
              </Form.Label>
              {isEditing ? (
                <Form.Control type="email" value={profile.email} readOnly disabled />
              ) : (
                <span className="form-control-plaintext fw-semibold">{profile.email}</span>
              )}
              <Form.Text className="text-muted">
                Your email cannot be changed here.
              </Form.Text>
            </Form.Group>

            <Row className="g-3">
              <Col md={6}>
                <Form.Group controlId="formFirstName">
                  <Form.Label className="small fw-semibold text-muted">First Name</Form.Label>
                  {isEditing ? (
                    <Form.Control type="text" name="first_name" value={profile.first_name} onChange={handleChange} />
                  ) : (
                    <span className="form-control-plaintext fw-semibold">{profile.first_name || '—'}</span>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group controlId="formLastName">
                  <Form.Label className="small fw-semibold text-muted">Last Name</Form.Label>
                  {isEditing ? (
                    <Form.Control type="text" name="last_name" value={profile.last_name} onChange={handleChange} />
                  ) : (
                    <span className="form-control-plaintext fw-semibold">{profile.last_name || '—'}</span>
                  )}
                </Form.Group>
              </Col>
            </Row>

            {isEditing && (
              <div className="d-flex align-items-center gap-2 mt-4 pt-3 border-top">
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" className="me-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="me-1" size={16} />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button variant="outline-secondary" onClick={handleCancel} disabled={loading}>
                  Cancel
                </Button>
                <div className="ms-auto">
                  <Button variant="outline-warning" onClick={() => { setPasswordResetFlag(true); }} disabled={loading}>
                    <Key className="me-1" size={16} />
                    Reset Password
                  </Button>
                </div>
              </div>
            )}
          </Form>
        </Card.Body>
      </Card>
      
      <UpdatePasswordModal />
    </Container>
  );
}
