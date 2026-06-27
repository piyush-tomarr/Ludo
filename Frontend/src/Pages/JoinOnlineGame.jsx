import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classes from './JoinOnlineGame.module.css';
import { useSound } from '../context/SoundContext';
import { fetchProfileFun, deductCoinsFun } from '../Services/ApiFun';
import useTranslate from '../Util/ChangeLang';
import Emoji from '../Components/Emoji';

const JoinOnlineGame = () => {
    const navigate = useNavigate();
    const { initBgMusic } = useSound();
    const t = useTranslate();
    const [userCoins, setUserCoins] = useState(0);
    const [userId, setUserId] = useState(null);
    const [playerName, setPlayerName] = useState('');

    useEffect(() => {
        initBgMusic();
        const user = JSON.parse(localStorage.getItem('ludo_user') || 'null');
        const savedName = localStorage.getItem('ludo_player_name');
        if (savedName) setPlayerName(savedName);

        if (!user) {
            navigate('/auth', { state: { from: '/online/join' }, replace: true });
            return;
        }

        setUserId(user.id);
        fetchProfileFun(user.id).then(res => {
            setUserCoins(res.user.coins);
        }).catch(console.error);
    }, [initBgMusic, navigate]);

    const [gameId, setGameId] = useState('');
    const [isJoining, setIsJoining] = useState(false);
    const [error, setError] = useState('');

    const handleJoinGame = async () => {
        if (!gameId.trim()) {
            setError(t('Please enter a Room ID'));
            return;
        }

        if (!playerName.trim()) {
            setError(t('Please enter your name'));
            return;
        }

        const entryFee = 100;
        if (userCoins < entryFee) {
            setError(`${t('Insufficient Coins!')} ${t('You need')} ${entryFee} ${t('coins to join.')}`);
            return;
        }

        setIsJoining(true);
        setError('');

        try {
            // Navigate to game lobby
            localStorage.setItem('ludo_player_name', playerName.trim());
            navigate(`/lobby/${gameId.trim()}`, { state: { playerName: playerName.trim(), shouldDeduct: true } });
        } catch (err) {
            console.error('Failed to join game:', err);
            setError(err.message || t('Something went wrong. Please try again.'));
        } finally {
            setIsJoining(false);
        }
    };

    const handlePaste = async () => {
        try {
            const text = await navigator.clipboard.readText();
            setGameId(text.trim().toUpperCase());
        } catch (err) {
            console.error('Failed to read clipboard:', err);
        }
    };

    return (
        <div className={classes.container}>
            <div className={classes.background}>
                <div className={classes.circle}></div>
                <div className={classes.circle}></div>
            </div>

            <button className={classes.backButton} onClick={() => navigate('/online-mode')}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
                <span>{t('Back')}</span>
            </button>

            <div className={classes.content}>

                <div className={classes.walletBadge}>
                    <span className={classes.walletIcon}><Emoji id="coin" size="1.2rem" /></span>
                    <span className={classes.walletValue}>{userCoins?.toLocaleString()}</span>
                </div>

                <div className={classes.header}>
                    <h1 className={classes.title}>{t('Join Room')}</h1>
                    <p className={classes.subtitle}>{t('Match Entry Fee')}: <span className={classes.feeTxt}>100 {t('Coins')}</span></p>
                </div>

                {error && <div className={classes.errorBox}>{error}</div>}

                <div className={classes.formBody}>
                    <div className={classes.inputGroup}>
                        <div className={classes.inputLabel}>{t('YOUR DISPLAY NAME')}</div>
                        <input
                            type="text"
                            className={classes.mainInput}
                            placeholder={t("Enter Name...")}
                            value={playerName}
                            onChange={(e) => setPlayerName(e.target.value)}
                        />
                    </div>

                    <div className={classes.inputGroup}>
                        <div className={classes.inputLabel}>{t('ROOM ID')}</div>
                        <div className={classes.roomInputWrapper}>
                            <input
                                type="text"
                                className={classes.mainInput}
                                style={{ fontFamily: 'monospace', letterSpacing: '2px', textTransform: 'uppercase' }}
                                placeholder={t("ENTER ROOM ID")}
                                value={gameId}
                                onChange={(e) => setGameId(e.target.value.toUpperCase())}
                            />
                            <button className={classes.pasteIconBtn} onClick={handlePaste} title="Paste ID">
                                📋
                            </button>
                        </div>
                    </div>

                    <button
                        className={classes.joinButton}
                        onClick={handleJoinGame}
                        disabled={isJoining || !gameId.trim() || !playerName.trim()}
                    >
                        {isJoining ? t('JOINING') + '...' : (
    <>{t('JOIN & PAY')} 100 <Emoji id="coin" size="1.2rem" /></>
)}
                    </button>
                </div>

                <div className={classes.helpNote}>
                    <div className={classes.noteIcon}>💡</div>
                    <div className={classes.noteText}>{t('Ask your host for the Room ID to join the match correctly')}</div>
                </div>
            </div>
        </div>
    );
};

export default JoinOnlineGame;
