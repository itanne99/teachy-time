import React, { useState, useEffect } from 'react';
import { Modal, Button, Nav, Badge, Alert } from 'react-bootstrap';
import { FileEarmarkText, ShieldCheck, CheckCircleFill, ShieldLock } from 'react-bootstrap-icons';

export const LegalModal = ({ show, onHide, initialType = 'terms' }) => {
  const [activeType, setActiveType] = useState(initialType);

  useEffect(() => {
    if (show && initialType) {
      setActiveType(initialType);
    }
  }, [show, initialType]);

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      scrollable
      className="legal-modal"
      aria-labelledby="legal-modal-title"
    >
      <Modal.Header
        closeButton
        className="border-bottom px-4 py-3 bg-light"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="d-flex align-items-center gap-3 w-100">
          <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-opacity-10 text-primary rounded-circle p-2">
            {activeType === 'terms' ? <FileEarmarkText size={22} /> : <ShieldCheck size={22} />}
          </div>
          <div>
            <Modal.Title id="legal-modal-title" className="h5 fw-bold mb-0 text-dark">
              {activeType === 'terms' ? 'Terms of Service' : 'Privacy Policy'}
            </Modal.Title>
            <div className="d-flex align-items-center gap-2 mt-1">
              <Badge bg="dark" className="bg-opacity-10 text-dark fw-semibold px-2 py-1">
                Last Updated: August 2026
              </Badge>
              <span className="text-secondary small">•</span>
              <span className="text-dark small fw-medium">Teachy Time Platform</span>
            </div>
          </div>
        </div>
      </Modal.Header>

      <div className="px-4 pt-3 pb-2 bg-light border-bottom" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
        <Nav variant="pills" className="custom-nav-pills bg-white p-1 rounded-3 nav-justified border shadow-sm" style={{ fontSize: '0.9rem' }}>
          <Nav.Item>
            <Nav.Link
              active={activeType === 'terms'}
              onClick={(e) => {
                e.stopPropagation();
                setActiveType('terms');
              }}
              className={`py-2 fw-semibold rounded-2 ${activeType === 'terms' ? 'bg-primary text-white shadow-sm' : 'text-dark bg-transparent'}`}
              style={{ cursor: 'pointer' }}
            >
              <FileEarmarkText className="me-1" size={16} /> Terms of Service
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              active={activeType === 'privacy'}
              onClick={(e) => {
                e.stopPropagation();
                setActiveType('privacy');
              }}
              className={`py-2 fw-semibold rounded-2 ${activeType === 'privacy' ? 'bg-primary text-white shadow-sm' : 'text-dark bg-transparent'}`}
              style={{ cursor: 'pointer' }}
            >
              <ShieldCheck className="me-1" size={16} /> Privacy Policy
            </Nav.Link>
          </Nav.Item>
        </Nav>
      </div>

      <Modal.Body className="p-4 bg-white">
        {activeType === 'terms' ? (
          <div className="legal-content">
            <Alert variant="primary" className="border-0 bg-primary bg-opacity-10 text-dark mb-4 py-3 px-3 rounded-3 shadow-none border-start border-4 border-primary">
              <div className="d-flex gap-2">
                <CheckCircleFill className="text-primary mt-1 flex-shrink-0" size={18} />
                <div className="small text-dark" style={{ lineHeight: '1.5' }}>
                  <strong className="text-dark">Summary for Educators:</strong> Teachy Time is built to empower teachers and schools with reliable classroom timing and schedules. We respect your ownership of all schedule data you create.
                </div>
              </div>
            </Alert>

            <section className="mb-4">
              <h6 className="fw-bold text-dark mb-2">1. Acceptance of Terms</h6>
              <p className="text-dark mb-0">
                By creating an account, accessing, or using the Teachy Time application (&quot;Service&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you agree to be bound by these Terms of Service. If you are using Teachy Time on behalf of an educational institution, school district, or organization, you represent that you have the authority to accept these terms on its behalf.
              </p>
            </section>

            <section className="mb-4">
              <h6 className="fw-bold text-dark mb-2">2. Eligibility & Account Security</h6>
              <p className="text-dark mb-2">
                Teachy Time is designed for teachers, educators, administrators, and individuals managing learning schedules. You must be at least 18 years old or have legitimate authorization from an educational institution.
              </p>
              <p className="text-dark mb-0">
                You are responsible for maintaining the confidentiality of your credentials (including passwords and magic link access) and for all activities that occur under your account. You agree to notify us immediately of any unauthorized access.
              </p>
            </section>

            <section className="mb-4">
              <h6 className="fw-bold text-dark mb-2">3. Acceptable Use Policy</h6>
              <p className="text-dark mb-2">
                You agree to use Teachy Time only for lawful, educational, and organizational purposes. You agree NOT to:
              </p>
              <ul className="text-dark ps-3 mb-0">
                <li className="mb-1">Reverse engineer, decompile, copy, or disassemble any part of the service.</li>
                <li className="mb-1">Interfere with, overburden, or disrupt the integrity or performance of the servers and network infrastructure.</li>
                <li className="mb-1">Store or transmit infringing, defamatory, or unlawful material.</li>
                <li className="mb-1">Input sensitive student personally identifiable information (such as Social Security numbers or medical records) into timer labels or notes.</li>
              </ul>
            </section>

            <section className="mb-4">
              <h6 className="fw-bold text-dark mb-2">4. Intellectual Property & User Data</h6>
              <p className="text-dark mb-2">
                <strong className="text-dark">Our IP:</strong> The Teachy Time software, visual progress bars, interval timer algorithms, sound library, logos, and interface designs are protected by copyright and intellectual property laws.
              </p>
              <p className="text-dark mb-0">
                <strong className="text-dark">Your Content:</strong> You retain complete ownership of the schedules, alarms, timers, and customized labels you create in your account. You grant Teachy Time a limited license solely to store, process, and display your schedules to you across your authorized devices.
              </p>
            </section>

            <section className="mb-4">
              <h6 className="fw-bold text-dark mb-2">5. Service Availability & Chime Notifications</h6>
              <p className="text-dark mb-0">
                We strive for continuous, reliable availability. Audio chimes, countdown visualizers, and alarm notifications execute within your web browser environment and depend on browser audio permissions, background tab handling, and hardware settings. Teachy Time is designed as a classroom productivity tool and must not be used as an emergency alarm or critical safety system.
              </p>
            </section>

            <section className="mb-4">
              <h6 className="fw-bold text-dark mb-2">6. Disclaimer of Warranties & Limitation of Liability</h6>
              <p className="text-dark mb-2">
                The service is provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; without warranties of any kind, whether express or implied.
              </p>
              <p className="text-dark mb-0">
                To the maximum extent permitted by applicable law, Teachy Time and its creators shall not be liable for any indirect, incidental, special, exemplary, or consequential damages resulting from your use of or inability to use the service.
              </p>
            </section>

            <section className="mb-4">
              <h6 className="fw-bold text-dark mb-2">7. Account Termination</h6>
              <p className="text-dark mb-0">
                You may terminate your account at any time through your Profile settings. We reserve the right to suspend or terminate accounts that violate these Terms or threaten the security and availability of the platform.
              </p>
            </section>

            <section className="mb-0">
              <h6 className="fw-bold text-dark mb-2">8. Contact Us</h6>
              <p className="text-dark mb-0">
                If you have any questions or concerns regarding these Terms, please contact our support team at <a href="mailto:support@teachytime.com" className="text-primary text-decoration-none fw-bold">support@teachytime.com</a>.
              </p>
            </section>
          </div>
        ) : (
          <div className="legal-content">
            <Alert variant="success" className="border-0 bg-success bg-opacity-10 text-dark mb-4 py-3 px-3 rounded-3 shadow-none border-start border-4 border-success">
              <div className="d-flex gap-2">
                <ShieldLock className="text-success mt-1 flex-shrink-0" size={18} />
                <div className="small text-dark" style={{ lineHeight: '1.5' }}>
                  <strong className="text-dark">Student & Teacher Privacy Commitment:</strong> We adhere to FERPA and COPPA principles. We <strong className="text-dark">NEVER sell your data</strong>, rent personal information, or show targeted third-party advertising.
                </div>
              </div>
            </Alert>

            <section className="mb-4">
              <h6 className="fw-bold text-dark mb-2">1. Privacy Philosophy & Compliance</h6>
              <p className="text-dark mb-0">
                Teachy Time respects the privacy of educators, school staff, and educational institutions. We collect only the minimal data strictly necessary to deliver high-quality classroom scheduling and timing features. We operate in compliance with student data privacy frameworks including the Family Educational Rights and Privacy Act (<strong>FERPA</strong>) and the Children&apos;s Online Privacy Protection Act (<strong>COPPA</strong>).
              </p>
            </section>

            <section className="mb-4">
              <h6 className="fw-bold text-dark mb-2">2. Information We Collect</h6>
              <p className="text-dark mb-2">We collect the following categories of information:</p>
              <ul className="text-dark ps-3 mb-0">
                <li className="mb-2">
                  <strong className="text-dark">Account Information:</strong> Your name, email address, and hashed credentials provided during registration or magic link authentication.
                </li>
                <li className="mb-2">
                  <strong className="text-dark">Classroom & Schedule Data:</strong> Schedule configurations, timer blocks, alarm labels (e.g. &quot;Math Period&quot;, &quot;Reading Group&quot;), warning lead times, and sound preference settings.
                </li>
                <li className="mb-2">
                  <strong className="text-dark">Technical & Session Data:</strong> Basic device type, browser information, and essential session cookies strictly required for secure login and state persistence.
                </li>
              </ul>
            </section>

            <section className="mb-4">
              <h6 className="fw-bold text-dark mb-2">3. How We Use Your Information</h6>
              <p className="text-dark mb-2">Your information is used exclusively to:</p>
              <ul className="text-dark ps-3 mb-0">
                <li className="mb-1">Authenticate your account and maintain session security.</li>
                <li className="mb-1">Synchronize your timers and schedules across all your classroom devices.</li>
                <li className="mb-1">Send critical system emails (email confirmations, password resets).</li>
                <li className="mb-1">Diagnose technical issues and improve platform reliability.</li>
              </ul>
            </section>

            <section className="mb-4">
              <h6 className="fw-bold text-dark mb-2">4. Third-Party Service Providers</h6>
              <p className="text-dark mb-0">
                We do not sell or rent data. We utilize trusted, enterprise-grade cloud service providers (such as Supabase for encrypted PostgreSQL database storage and authentication, and Vercel for hosting). All providers are vetted to ensure rigorous security standards and compliance with data protection laws.
              </p>
            </section>

            <section className="mb-4">
              <h6 className="fw-bold text-dark mb-2">5. Data Security & Storage</h6>
              <p className="text-dark mb-0">
                We implement industry-standard encryption protocols (TLS 1.3 in transit and AES-256 at rest). Database access is enforced via strict PostgreSQL Row-Level Security (RLS) policies, ensuring that each educator&apos;s schedules and timer settings are accessible only by their authorized account.
              </p>
            </section>

            <section className="mb-4">
              <h6 className="fw-bold text-dark mb-2">6. Your Rights & Data Deletion</h6>
              <p className="text-dark mb-0">
                You retain full ownership and control of your data. You may review, modify, or permanently delete your account and all associated schedules at any time from your Profile settings, or by emailing <a href="mailto:privacy@teachytime.com" className="text-primary text-decoration-none fw-bold">privacy@teachytime.com</a>. Upon account deletion, all stored data is permanently removed from our active databases.
              </p>
            </section>

            <section className="mb-0">
              <h6 className="fw-bold text-dark mb-2">7. Privacy Inquiries</h6>
              <p className="text-dark mb-0">
                If you have questions regarding our privacy practices or wish to submit a data request, please contact our Data Protection team at <a href="mailto:privacy@teachytime.com" className="text-primary text-decoration-none fw-bold">privacy@teachytime.com</a>.
              </p>
            </section>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer
        className="border-top px-4 py-3 bg-light d-flex justify-content-between align-items-center"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Button
          variant="link"
          className="text-decoration-none text-primary p-0 small fw-semibold"
          onClick={(e) => {
            e.stopPropagation();
            setActiveType(activeType === 'terms' ? 'privacy' : 'terms');
          }}
        >
          {activeType === 'terms' ? 'Read Privacy Policy →' : 'Read Terms of Service →'}
        </Button>
        <Button
          variant="primary"
          onClick={(e) => {
            e.stopPropagation();
            onHide();
          }}
          className="px-4 fw-semibold"
        >
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
