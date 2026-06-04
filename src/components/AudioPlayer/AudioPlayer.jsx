import React, { useState, useEffect, useRef } from 'react';
import ReactAudioPlayer from 'react-audio-player';
import { Container, Button, Navbar } from 'react-bootstrap';
import { MusicNoteBeamed } from 'react-bootstrap-icons';
import { useStore } from '@/services/useStore';

export const AudioPlayer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const audioRef = useRef(null);
  
  // Get state and actions from global store
  const audioSrc = useStore((state) => state.audioSrc);
  const isPlaying = useStore((state) => state.isPlaying);
  const setIsPlaying = useStore((state) => state.setIsPlaying);

  // Sync internal player state with global store
  useEffect(() => {
    if (!audioRef.current) return;
    
    const audioEl = audioRef.current.audioEl.current;
    if (isPlaying) {
      audioEl.play().catch(err => console.error("Playback failed:", err));
      // Show the player automatically when it starts playing
      setIsVisible(true);
    } else {
      audioEl.pause();
    }
  }, [isPlaying]);

  const handlePlay = () => setIsPlaying(true);
  const handlePause = () => setIsPlaying(false);

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
        pointerEvents: 'none'
      }}
    >
      <Container fluid className="d-flex align-items-center">
        <div style={{ width: '50px' }} className="d-none d-md-block" />

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
          {audioSrc ? (
            <ReactAudioPlayer
              src={audioSrc}
              controls
              className="w-100"
              style={{ maxWidth: '800px' }}
              ref={audioRef}
              onPlay={handlePlay}
              onPause={handlePause}
            />
          ) : (
            <div className="text-muted small italic">No track selected</div>
          )}
        </div>

        <Button
          variant="primary"
          className="rounded-circle shadow-lg"
          style={{ 
            width: '50px', 
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'auto',
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
