const STORAGE_KEY = 'cruise_welcome_seen_v1'

export default function WelcomeModal({ onDismiss }) {
  return (
    <div className="welcome-overlay">
      <div className="welcome-card">
        <div className="welcome-logo">🐻‍❄️</div>
        <h2 className="welcome-title">¡Bienvenidos a Alaska 2026!</h2>
        <p className="welcome-body">
          Esta app tiene todo lo que necesitan saber para el viaje — su itinerario personal
          día a día, vuelos, camarote, y los tours que les tocan.
        </p>
        <p className="welcome-subtitle">Algunas cositas:</p>
        <ul className="welcome-list">
          <li>Estén pendientes del horario y lugar de encuentro para los tours.</li>
          <li>Si quieren saber más detalle, clickeen en el nombre del tour para ver qué vamos a hacer, quién viene y cómo vestirse.</li>
          <li>Noten que hay un Packing List en el tab de al lado.</li>
        </ul>
        <p className="welcome-sign">¡Nos vemos en Alaska! 🐻‍❄️</p>
        <button className="welcome-btn" onClick={onDismiss}>Entendido</button>
      </div>
    </div>
  )
}

export function shouldShowWelcome() {
  return !localStorage.getItem(STORAGE_KEY)
}

export function markWelcomeSeen() {
  localStorage.setItem(STORAGE_KEY, '1')
}
