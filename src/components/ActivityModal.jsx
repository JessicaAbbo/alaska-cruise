import { useEffect } from 'react'

export default function ActivityModal({ act, isOptIn, participants, onClose }) {
  // Close on back button / escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="modal-title">{act.name}</div>
        {act.operator && <div className="modal-operator">{act.operator}</div>}
        {(act.meetingTime || act.startEnd) && (
          <div className="modal-time">
            {act.meetingTime && <>Meet {act.meetingTime}</>}
            {act.meetingTime && act.startEnd && ' · '}
            {act.startEnd}
          </div>
        )}

        {act.description && (
          <div className="modal-section">
            <div className="modal-section-label">About</div>
            <div className="modal-body-text">{act.description}</div>
          </div>
        )}

        <div className="modal-section">
          <div className="modal-section-label">Participants</div>
          {isOptIn ? (
            participants && participants.length > 0 ? (
              <ul className="modal-participants">
                {participants.map(name => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            ) : (
              <p className="modal-muted">No sign-ups yet.</p>
            )
          ) : (
            <p className="modal-whole-group">🌊 Whole Group</p>
          )}
        </div>
      </div>
    </div>
  )
}
