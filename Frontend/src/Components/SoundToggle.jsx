import { useSound } from '../context/SoundContext';
import { useLocation } from 'react-router-dom';

const SoundToggle = () => {
    const { isMusicMuted, toggleMusic } = useSound();
    const location = useLocation();

    // Hide global toggle on the game page (GameRoom) since it has its own settings
    if (location.pathname.startsWith('/game/')) return null;

    return (
        <button
            onClick={toggleMusic}
            style={{
                position: 'fixed',
                bottom: '85px',
                right: '25px',
                zIndex: 9999,
                background: 'rgba(255, 255, 255, 0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                width: '45px',
                height: '45px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
                transition: 'all 0.3s ease',
                padding: '0',
            }}
            title={isMusicMuted ? 'Turn Music ON' : 'Turn Music OFF'}
            onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            }}
        >
            {isMusicMuted ? (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                    <line x1="2" y1="2" x2="22" y2="22" stroke="white" strokeWidth="2" />
                </svg>
            ) : (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M9 18V5l12-2v13" />
                    <circle cx="6" cy="18" r="3" />
                    <circle cx="18" cy="16" r="3" />
                </svg>
            )}
        </button>
    );
};

export default SoundToggle;
