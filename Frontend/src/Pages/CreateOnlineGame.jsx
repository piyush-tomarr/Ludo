import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createGame, fetchProfileFun, deductCoinsFun } from '../Services/ApiFun';
import classes from './CreateOnlineGame.module.css';
import { useSound } from '../context/SoundContext';
import useTranslate from '../Util/ChangeLang';
import { FaCheck } from 'react-icons/fa';
import Emoji from '../Components/Emoji';

const CreateOnlineGame = () => {
    const navigate = useNavigate();
    const { initBgMusic } = useSound();
    const t = useTranslate();
    const [userCoins, setUserCoins] = useState(0);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        initBgMusic();
        const user = JSON.parse(localStorage.getItem('ludo_user') || 'null');
        if (!user) {
            navigate('/auth', { state: { from: '/online/create' }, replace: true });
            return;
        }
        setUserId(user.id);
        fetchProfileFun(user.id).then(res => {
            setUserCoins(res.user.coins);
        }).catch(console.error);
    }, [initBgMusic, navigate]);

    const [selectedPlayers, setSelectedPlayers] = useState(4);
    const [playerName, setPlayerName] = useState('');

    useEffect(() => {
        const savedName = localStorage.getItem('ludo_player_name');
        if (savedName) setPlayerName(savedName);
    }, []);

    const [gameId, setGameId] = useState(null);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState('');

    const handleCreateGame = async () => {
        if (!playerName.trim()) {
            setError(t('Please enter your name'));
            return;
        }

        const entryFee = 100;
        if (userCoins < entryFee) {
            setError(`${t('Insufficient Coins!')} ${t('You need')} ${entryFee} ${t('coins to create a game.')}`);
            return;
        }

        setIsCreating(true);
        setError('');

        try {
            // Create game with just the host player initially
            const createdGameId = await createGame([{ name: playerName.trim(), userId: userId }], selectedPlayers);

            if (createdGameId) {
                setGameId(createdGameId);
            }
        } catch (err) {
            console.error('Failed to create game:', err);
            setError(err.message || t('Something went wrong. Please try again.'));
        } finally {
            setIsCreating(false);
        }
    };

    const handleCopyGameId = () => {
        if (gameId) {
            navigator.clipboard.writeText(gameId);
            const btn = document.getElementById('copy-btn');
            if (btn) {
                const originalText = btn.textContent;
                btn.textContent = t('COPY ID') === 'መለያ ቁጥሩን ቅዳ' ? 'ቅዳ ተደርጓል!' : 'Copied!';
                setTimeout(() => {
                    btn.textContent = originalText;
                }, 2000);
            }
        }
    };

    const handleStartGame = () => {
        if (gameId) {
            localStorage.setItem('ludo_player_name', playerName.trim());
            navigate(`/lobby/${gameId}`, { state: { isHost: true, playerName, maxPlayers: selectedPlayers, shouldDeduct: true } });
        }
    };

    if (gameId) {
        return (
            <div className={classes.container}>
                <div className={classes.background}>
                    <div className={classes.circle}></div>
                    <div className={classes.circle}></div>
                </div>

                <div className={classes.content}>
                    <div className={classes.successCard}>
                        <div className={classes.successIcon}><FaCheck /></div>
                        <h1 className={classes.successTitle}>{t('GAME READY!')}</h1>
                        <p className={classes.successSubtitle}>{t('Share the Room ID with your friends')}</p>

                        <div className={classes.gameIdSection}>
                            <div className={classes.idLabel}>{t('ROOM ID')}</div>
                            <h2 className={classes.idValueDisplay}>{gameId}</h2>
                            <button id="copy-btn" className={classes.copyBtn} onClick={handleCopyGameId}>
                                {t('COPY ID')}
                            </button>
                        </div>

                        <div className={classes.summaryBox}>
                            <div className={classes.sumLine}>
                                <span>{t('Players')}:</span>
                                <strong>{selectedPlayers} {t('Players')}</strong>
                            </div>
                            <div className={classes.sumLine}>
                                <span>{t('Entry Fee')}:</span>
                                <strong style={{ color: '#ffd700' }}>100 <Emoji id="coin" size="1.2rem" /> </strong>
                            </div>
                        </div>

                        <button className={classes.mainActionBtn} onClick={handleStartGame}>
                            {t('GO TO LOBBY')}
                        </button>
                        <button className={classes.secondaryBtn} onClick={() => navigate('/menu')}>
                            {t('EXIT TO MENU')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

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
                    <h1 className={classes.title}>{t('Create Room')}</h1>
                    <p className={classes.subtitle}>{t('Match Entry Fee')}: <span className={classes.feeTxt}>100 {t('Coins')}</span></p>
                </div>

                {error && <div className={classes.errorToast}>{error}</div>}

                <div className={classes.inputSection}>
                    <div className={classes.fieldLabel}>{t('YOUR DISPLAY NAME')}</div>
                    <input
                        type="text"
                        className={classes.nameInput}
                        placeholder={t("Enter Name...")}
                        value={playerName}
                        onChange={(e) => setPlayerName(e.target.value)}
                        maxLength={20}
                    />
                </div>

                <div className={classes.selectionSection}>
                    <div className={classes.fieldLabel}>{t('MAX PLAYERS')}</div>
                    <div className={classes.optionsGrid}>
                        {[2, 3, 4].map((count) => (
                            <button
                                key={count}
                                className={`${classes.countCard} ${selectedPlayers === count ? classes.selectedCard : ''}`}
                                onClick={() => setSelectedPlayers(count)}
                                style={{ '--card-theme': count === 2 ? '#ff4d4d' : count === 3 ? '#4caf50' : '#2196f3' }}
                            >
                                <div className={classes.countNum}>{count}</div>
                                <div className={classes.countSub}>{t('Players')}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <button
                    className={classes.actionButton}
                    onClick={handleCreateGame}
                    disabled={isCreating || !playerName.trim()}
                >
                    {isCreating ? t('PROCESS...') : (
    <>
        {t('CREATE & PAY 100')}<Emoji id="coin" size="1.2rem" />
    </>
)}
                    {!isCreating && <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" /></svg>}
                </button>
            </div>
        </div>
    );
};

export default CreateOnlineGame;
