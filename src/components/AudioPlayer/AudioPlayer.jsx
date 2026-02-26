import React, { useState } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import { Container, Button, Navbar } from 'react-bootstrap';
import { MusicNoteBeamed } from 'react-bootstrap-icons';
import CommonUtils from '@/services/CommonUtils';

export const AudioPlayer = ({ src }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <Navbar
      fixed="bottom"
      className="py-2"
      style={{ 
        zIndex: 1050, 
        backgroundColor: isVisible ? 'white' : 'transparent',
        borderTop: isVisible ? '1px solid #dee2e6' : 'none',
        boxShadow: isVisible ? '0 -0.5rem 1rem rgba(0, 0, 0, 0.15)' : 'none',
        transition: 'all 0.3s ease-in-out',
        pointerEvents: 'none' // Allows clicking elements behind the transparent navbar
      }}
    >
      <Container fluid className="d-flex align-items-center">
        {/* Spacer to balance the button and keep player centered on larger screens */}
        <div style={{ width: '50px' }} className="d-none d-md-block" />

        {/* Audio Player Content */}
        <div 
          className="flex-grow-1 d-flex justify-content-center px-3"
          style={{ 
            opacity: isVisible ? 1 : 0,
            visibility: isVisible ? 'visible' : 'hidden',
            transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.3s ease-in-out',
            pointerEvents: isVisible ? 'auto' : 'none'
          }}
        >
          {CommonUtils.isNullOrWhitespace(src) ? <div className="text-muted">No audio available</div> : <ReactAudioPlayer
            src={src}
            controls
            className="w-100"
            style={{ maxWidth: '800px' }}
          />}
        </div>

        {/* Toggle Button - Always visible and in-line with the player */}
        <Button
          variant="primary"
          className="rounded-circle shadow-lg"
          style={{ 
            width: '50px', 
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto', // Always clickable
            transition: 'all 0.3s ease',
            zIndex: 1060
          }}
          onClick={() => setIsVisible(!isVisible)}
          aria-label={isVisible ? "Hide Audio Player" : "Show Audio Player"}
        >
          <MusicNoteBeamed size={22} />
        </Button>
      </Container>
    </Navbar>
  );
};
