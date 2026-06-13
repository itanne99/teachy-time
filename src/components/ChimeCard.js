import { Card, Badge, Button } from 'react-bootstrap'
import { MusicNoteBeamed, Star, PlayFill, StopFill, Trash2 } from 'react-bootstrap-icons'

export default function ChimeCard({
  sound,
  isDefault = false,
  isPlaying = false,
  playProgress = 0,
  onSetDefault,
  onPlayPreview,
  onDelete = null,
  isCustom = false
}) {
  return (
    <Card
      className={`h-100 border tt-sound-card position-relative overflow-hidden ${isDefault ? 'border-primary border-2 animate-select' : 'border-light shadow-sm'}`}
      onClick={() => {
        if (!isDefault && onSetDefault) onSetDefault(sound.id)
        if (onPlayPreview) onPlayPreview(sound)
      }}
    >
      {isCustom ? (
        <Card.Body className="p-3 pb-4">
          <div className="d-flex align-items-start justify-content-between mb-2">
            <div className="d-flex align-items-center gap-2 flex-grow-1 min-w-0">
              <MusicNoteBeamed size={18} className="text-primary flex-shrink-0" />
              <div className="min-w-0">
                <h6 className="mb-0 text-truncate" title={sound.name}>{sound.name}</h6>
                {sound.created_at && (
                  <small className="text-muted">{new Date(sound.created_at).toLocaleDateString()}</small>
                )}
              </div>
            </div>
            {isDefault && (
              <Badge bg="primary" pill className="flex-shrink-0">
                <Star size={10} className="me-1" />
                Default
              </Badge>
            )}
          </div>
          <div className="d-flex align-items-center gap-2 mt-2">
            <Button
              variant={isPlaying ? 'primary' : 'outline-secondary'}
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                if (onPlayPreview) onPlayPreview(sound)
              }}
              className="flex-grow-1"
            >
              {isPlaying ? (
                <><StopFill size={14} className="me-1" /> Stop</>
              ) : (
                <><PlayFill size={14} className="me-1" /> Play</>
              )}
            </Button>
            {!isDefault && onSetDefault && (
              <Button
                variant="outline-primary"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onSetDefault(sound.id)
                  if (onPlayPreview) onPlayPreview(sound)
                }}
                title="Set as default"
              >
                <Star size={14} />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="outline-danger"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(sound)
                }}
                title="Delete"
              >
                <Trash2 size={14} />
              </Button>
            )}
          </div>
        </Card.Body>
      ) : (
        <Card.Body className="p-2 pb-3 text-center">
          <div className="mb-1">
            {isPlaying ? (
              <StopFill size={20} className="text-primary" />
            ) : (
              <MusicNoteBeamed size={20} className="text-primary" />
            )}
          </div>
          <div className="small text-truncate" title={sound.name}>{sound.name}</div>
          {isDefault && (
            <Badge bg="primary" pill className="mt-1" style={{ fontSize: '0.65rem' }}>
              <Star size={8} className="me-1" />Default
            </Badge>
          )}
        </Card.Body>
      )}
      {isPlaying && (
        <div
          className="position-absolute bottom-0 start-0 bg-primary"
          style={{
            height: isCustom ? '4px' : '3px',
            width: `${playProgress}%`,
            transition: 'width 100ms linear'
          }}
        />
      )}
    </Card>
  )
}
