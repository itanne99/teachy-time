import { useState, useEffect, useRef } from "react";
import { Container, Form, Button, Alert, Card, Row, Col, Spinner, Modal, Badge, Toast, ToastContainer } from "react-bootstrap";
import supabase from "@/supabase/component";
import { useRouter } from "next/router";
import { useStore } from "@/services/useStore";
import { UpdatePasswordModal } from "@/components/models/UpdatePassword";
import { PersonCircle, Envelope, Key, PencilSquare, CheckCircle, Trash2, MusicNoteBeamed, Upload, Bell, Clock } from "react-bootstrap-icons";
import ChimeCard from "@/components/ChimeCard";
import { PRESET_CHIMES, CHIME_CATEGORIES } from "@/config/chimes";

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
  const setUserSounds = useStore((state) => state.setUserSounds);
  const setDefaultSound = useStore((state) => state.setDefaultSound);
  const setWarningLeadMinutes = useStore((state) => state.setWarningLeadMinutes);
  const setWarningChimeId = useStore((state) => state.setWarningChimeId);

  const [userSounds, setUserSoundsLocal] = useState([]);
  const [defaultSoundId, setDefaultSoundId] = useState(null);
  const [maxSounds, setMaxSounds] = useState(10);
  const [soundLoading, setSoundLoading] = useState(false);
  const [soundError, setSoundError] = useState(null);
  const [showDeleteSoundModal, setShowDeleteSoundModal] = useState(false);
  const [pendingSoundDelete, setPendingSoundDelete] = useState(null);
  const [deleteAffectedCount, setDeleteAffectedCount] = useState(0);
  const [toast, setToast] = useState({ show: false, message: "", variant: "success" });
  const [playingSoundId, setPlayingSoundId] = useState(null);
  const [playProgress, setPlayProgress] = useState(0);
  const [warningLeadMinutes, setWarningLeadMinutesLocal] = useState(3);
  const [warningChimeId, setWarningChimeIdLocal] = useState(null);
  const [warningSaving, setWarningSaving] = useState(false);
  const audioPreviewRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
        audioPreviewRef.current.ontimeupdate = null;
      }
    };
  }, []);

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

  useEffect(() => {
    if (user) {
      fetchSounds();
    }
  }, [user]);

  const fetchSounds = async () => {
    setSoundLoading(true);
    setSoundError(null);
    try {
      const response = await fetch("/api/alarmSounds");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to fetch sounds");
      setUserSoundsLocal(data.sounds || []);
      setDefaultSoundId(data.defaultSoundId);
      setMaxSounds(data.maxSounds);
      setUserSounds(data.sounds || []);
      const defaultObj = (data.sounds || []).find(s => s.id === data.defaultSoundId);
      setDefaultSound(defaultObj?.storage_url || null);

      const profileResponse = await fetch("/api/userProfile");
      const profileData = await profileResponse.json();
      if (profileResponse.ok) {
        setWarningLeadMinutesLocal(profileData.warning_lead_minutes ?? 3);
        setWarningChimeIdLocal(profileData.warning_chime_id || null);
        setWarningLeadMinutes(profileData.warning_lead_minutes ?? 3);
        setWarningChimeId(profileData.warning_chime_id || null);

        if (profileData.default_preset_sound_id) {
          const preset = PRESET_CHIMES.find(c => c.id === profileData.default_preset_sound_id);
          setDefaultSound(preset?.url || null);
        }
      }
    } catch (err) {
      console.error("Error fetching sounds:", err);
      setSoundError(err.message);
    } finally {
      setSoundLoading(false);
    }
  };

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

  const showToast = (message, variant = "success") => {
    setToast({ show: true, message, variant });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["audio/mpeg", "audio/wav", "audio/ogg", "audio/x-wav", "audio/mp3"];
    if (!allowedTypes.includes(file.type)) {
      showToast("Invalid file type. Allowed: MP3, WAV, OGG", "danger");
      e.target.value = "";
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast("File exceeds 5MB limit", "danger");
      e.target.value = "";
      return;
    }

    setSoundLoading(true);
    try {
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");

      const response = await fetch("/api/alarmSounds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name.replace(/\.[^/.]+$/, ""), fileData: base64, fileType: file.type }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed");

      await fetchSounds();
      showToast("Sound uploaded successfully!");
    } catch (err) {
      console.error("Error uploading sound:", err);
      showToast(err.message, "danger");
    } finally {
      setSoundLoading(false);
      e.target.value = "";
    }
  };

  const handlePlayPreview = (sound) => {
    if (playingSoundId === sound.id) {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
        audioPreviewRef.current.ontimeupdate = null;
      }
      setPlayingSoundId(null);
      setPlayProgress(0);
    } else {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
        audioPreviewRef.current.ontimeupdate = null;
      }
      const url = sound.storage_url || sound.url;
      const audio = new Audio(url);
      audioPreviewRef.current = audio;
      setPlayingSoundId(sound.id);
      setPlayProgress(0);

      audio.ontimeupdate = () => {
        if (audio.duration) {
          setPlayProgress((audio.currentTime / audio.duration) * 100);
        }
      };

      audio.onended = () => {
        setPlayingSoundId(null);
        setPlayProgress(0);
      };

      audio.play().catch((err) => console.error("Audio preview failed:", err));
    }
  };

  const handleSetDefaultSound = async (soundId) => {
    try {
      const isPreset = soundId?.startsWith("preset-");
      const body = { user_id: user.id };
      if (isPreset) {
        body.default_preset_sound_id = soundId;
      } else {
        body.default_sound_id = soundId;
      }

      const response = await fetch("/api/userProfile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!response.ok) throw new Error("Failed to update default sound");

      if (isPreset) {
        setDefaultSoundId(null);
        const preset = PRESET_CHIMES.find(c => c.id === soundId);
        setDefaultSound(preset?.url || null);
      } else {
        setDefaultSoundId(soundId);
        const sound = userSounds.find(s => s.id === soundId);
        setDefaultSound(sound?.storage_url || null);
      }
      showToast("Default sound updated!");
    } catch (err) {
      showToast(err.message, "danger");
    }
  };

  const requestDeleteSound = async (sound) => {
    try {
      const response = await fetch(`/api/alarmSounds?affectedCount=true&id=${sound.id}`);
      const data = await response.json();
      setDeleteAffectedCount(data.affectedAlarms || 0);
      setPendingSoundDelete(sound);
      setShowDeleteSoundModal(true);
    } catch (err) {
      showToast("Failed to check sound usage", "danger");
    }
  };

  const confirmDeleteSound = async () => {
    if (!pendingSoundDelete) return;
    setSoundLoading(true);
    try {
      const response = await fetch("/api/alarmSounds", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: pendingSoundDelete.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Delete failed");

      if (pendingSoundDelete.id === defaultSoundId) {
        setDefaultSoundId(null);
        setDefaultSound(null);
      }
      await fetchSounds();
      showToast("Sound deleted!");
    } catch (err) {
      showToast(err.message, "danger");
    } finally {
      setSoundLoading(false);
      setShowDeleteSoundModal(false);
      setPendingSoundDelete(null);
    }
  };

  const handleSaveWarningSettings = async () => {
    setWarningSaving(true);
    try {
      const response = await fetch("/api/userProfile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.id,
          warning_lead_minutes: warningLeadMinutes,
          warning_chime_id: warningChimeId,
        }),
      });
      if (!response.ok) throw new Error("Failed to update warning settings");
      setWarningLeadMinutes(warningLeadMinutes);
      setWarningChimeId(warningChimeId);
      showToast("Warning settings updated!");
    } catch (err) {
      showToast(err.message, "danger");
    } finally {
      setWarningSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100">
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-3" />
          <p className="text-muted mb-0">Loading profile...</p>
        </div>
      </div>
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
      
      <Card className="border-0 shadow-sm mt-4">
        <Card.Header className="bg-white border-0 py-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <span className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 rounded-circle" style={{ width: "48px", height: "48px" }}>
                <MusicNoteBeamed size={28} className="text-primary" />
              </span>
              <div>
                <h5 className="fw-bold mb-0">Sound Library</h5>
                <p className="text-muted small mb-0">
                  {userSounds.length} / {maxSounds} sounds used
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={soundLoading || userSounds.length >= maxSounds}
              title={userSounds.length >= maxSounds ? "Maximum sounds reached" : "Upload sound"}
            >
              <Upload className="me-1" size={14} />
              Upload
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3,.wav,.ogg,audio/mpeg,audio/wav,audio/ogg"
              onChange={handleFileUpload}
              style={{ display: "none" }}
            />
          </div>
        </Card.Header>
        <Card.Body>
          {soundError && <Alert variant="danger">{soundError}</Alert>}
          {soundLoading && (
            <div className="text-center py-3">
              <Spinner animation="border" variant="primary" size="sm" className="me-2" />
              <span className="text-muted small">Loading sounds...</span>
            </div>
          )}
          {userSounds.length === 0 && !soundLoading && (
            <p className="text-muted text-center py-3 mb-0">No sounds uploaded yet. Click "Upload" to add your first sound.</p>
          )}
          <Row className="g-3">
            {userSounds.map((sound) => (
              <Col key={sound.id} xs={12} sm={6} lg={4}>
                <ChimeCard
                  sound={sound}
                  isDefault={sound.id === defaultSoundId}
                  isPlaying={playingSoundId === sound.id}
                  playProgress={playProgress}
                  onSetDefault={handleSetDefaultSound}
                  onPlayPreview={handlePlayPreview}
                  onDelete={requestDeleteSound}
                  isCustom={true}
                />
              </Col>
            ))}
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm mt-4">
        <Card.Header className="bg-white border-0 py-3">
          <div className="d-flex align-items-center gap-3">
            <span className="d-inline-flex align-items-center justify-content-center bg-info bg-opacity-10 rounded-circle" style={{ width: "48px", height: "48px" }}>
              <MusicNoteBeamed size={28} className="text-info" />
            </span>
            <div>
              <h5 className="fw-bold mb-0">Preset Sounds</h5>
              <p className="text-muted small mb-0">Built-in chimes organized by category</p>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          {CHIME_CATEGORIES.map(category => (
            <div key={category} className="mb-3">
              <h6 className="text-muted small fw-bold mb-2">{category}</h6>
              <Row className="g-2">
                {PRESET_CHIMES.filter(c => c.category === category).map(chime => (
                  <Col key={chime.id} xs={6} sm={4} md={3} lg={2}>
                    <ChimeCard
                      sound={chime}
                      isDefault={chime.id === defaultSoundId}
                      isPlaying={playingSoundId === chime.id}
                      playProgress={playProgress}
                      onSetDefault={handleSetDefaultSound}
                      onPlayPreview={handlePlayPreview}
                      isCustom={false}
                    />
                  </Col>
                ))}
              </Row>
            </div>
          ))}
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm mt-4">
        <Card.Header className="bg-white border-0 py-3">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center gap-3">
              <span className="d-inline-flex align-items-center justify-content-center bg-warning bg-opacity-10 rounded-circle" style={{ width: "48px", height: "48px" }}>
                <Bell size={28} className="text-warning" />
              </span>
              <div>
                <h5 className="fw-bold mb-0">Warning Chime Settings</h5>
                <p className="text-muted small mb-0">Configure the cleanup warning before timers end</p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveWarningSettings}
              disabled={warningSaving}
            >
              {warningSaving ? (
                <><Spinner animation="border" size="sm" className="me-1" /> Saving...</>
              ) : (
                <><CheckCircle className="me-1" size={14} /> Save</>
              )}
            </Button>
          </div>
        </Card.Header>
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Group controlId="formWarningLeadTime">
                <Form.Label className="small fw-semibold text-muted d-flex align-items-center gap-1">
                  <Clock size={14} />
                  Warning Lead Time (minutes before end)
                </Form.Label>
                <Form.Select
                  value={warningLeadMinutes}
                  onChange={(e) => setWarningLeadMinutesLocal(parseInt(e.target.value, 10))}
                >
                  <option value={1}>1 minute</option>
                  <option value={2}>2 minutes</option>
                  <option value={3}>3 minutes</option>
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group controlId="formWarningChime">
                <Form.Label className="small fw-semibold text-muted d-flex align-items-center gap-1">
                  <Bell size={14} />
                  Warning Chime Sound
                </Form.Label>
                <Form.Select
                  value={warningChimeId || "__default__"}
                  onChange={(e) => setWarningChimeIdLocal(e.target.value === "__default__" ? null : e.target.value)}
                >
                  <option value="__default__">Default warning chime</option>
                  {PRESET_CHIMES.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                  {userSounds.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Modal show={showDeleteSoundModal} onHide={() => { setShowDeleteSoundModal(false); setPendingSoundDelete(null); }} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="d-flex align-items-center gap-2 text-danger">
            <Trash2 size={22} />
            Delete Sound
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <p className="text-muted mb-2">
            Are you sure you want to delete <strong>&quot;{pendingSoundDelete?.name}&quot;</strong>?
          </p>
          {deleteAffectedCount > 0 && (
            <Alert variant="warning" className="py-2 small">
              This sound is used by <strong>{deleteAffectedCount}</strong> alarm(s). They will revert to your default sound.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="outline-secondary" onClick={() => { setShowDeleteSoundModal(false); setPendingSoundDelete(null); }} disabled={soundLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDeleteSound} disabled={soundLoading}>
            {soundLoading ? <><Spinner animation="border" size="sm" className="me-2" /> Deleting...</> : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="top-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast
          onClose={() => setToast(prev => ({ ...prev, show: false }))}
          show={toast.show}
          delay={3000}
          autohide
          bg={toast.variant}
        >
          <Toast.Body className="text-white">{toast.message}</Toast.Body>
        </Toast>
      </ToastContainer>
      
      <UpdatePasswordModal />
    </Container>
  );
}
