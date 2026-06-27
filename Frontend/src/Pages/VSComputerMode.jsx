import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import classes from './PlayerCount.module.css';
import { useSound } from '../context/SoundContext';
import { fetchProfileFun, deductCoinsFun } from '../Services/ApiFun';
import useTranslate from '../Util/ChangeLang';
import Emoji from '../Components/Emoji';

const VSComputerMode = () => {
    const navigate = useNavigate();
    const { initBgMusic } = useSound();
    const t = useTranslate();
    const [userCoins, setUserCoins] = useState(0);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        initBgMusic();
        const user = JSON.parse(localStorage.getItem('ludo_user') || 'null');
        if (!user) {
            navigate('/auth', { state: { from: '/vs-computer' }, replace: true });
            return;
        }
        setUserId(user.id);
        fetchProfileFun(user.id).then(res => {
            setUserCoins(res.user.coins);
        }).catch(console.error);
    }, [initBgMusic, navigate]);

    const [selectedCount, setSelectedCount] = useState(4);

    const handleContinue = async () => {
        const entryFee = 100;
        if (userCoins < entryFee) {
            alert(t('Insufficient Coins! You need at least 100 coins to play Vs Computer.'));
            return;
        }

        try {
            // Coins will be deducted in SetupPlayers when the game actually starts
            // We bypass name entry for computer game and use defaults
            navigate('/setup-players', {
                state: {
                    playerCount: selectedCount,
                    isComputerGame: true
                }
            });
        } catch (err) {
            alert(err.message || "Failed to process entry fee.");
        }
    };

    const playerOptions = [
        { count: 2, color: '#2196f3', icon: '👤💻' },
        { count: 3, color: '#2196f3', icon: '👤💻💻' },
        { count: 4, color: '#2196f3', icon: '👤💻💻💻' }
    ];

   

    return (
        <div className={classes.container}>
            <div className={classes.background}>
                <div className={classes.circle}></div>
                <div className={classes.circle}></div>
            </div>

            {/* Back Button */}
            <button className={classes.backButton} onClick={() => navigate('/menu')}>
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
                <span>{t('Back')}</span>
            </button>

            <div className={classes.content}>

                {/* Wallet Badge */}
                <div className={classes.walletBadge}>
                    <span className={classes.walletIcon}><Emoji id="coin" size="1.2rem" /></span>
                    <span className={classes.walletValue}>{userCoins?.toLocaleString()}</span>
                </div>

                <div className={classes.header}>
                    <h1 className={classes.title}>{t('VS Computer')}</h1>
                    <p className={classes.subtitle}>{t('Entry Fee')}: <span className={classes.feeTxt}>100 {t('Coins')}</span></p>
                </div>

                <div id='selectBtn' className={classes.optionsContainer}>
                    {playerOptions.map((option) => (
                        <button
                            key={option.count}
                            className={`${classes.optionCard} ${selectedCount === option.count ? classes.selected : ''}`}
                            onClick={() => setSelectedCount(option.count)}
                            style={{ '--card-color': option.color }}
                        >
                            <div className={classes.iconContainer}>
                                <span className={classes.emoji}>{option.icon}</span>
                            </div>

                            <div className={classes.countNumber}>{option.count}</div>
                            <div className={classes.countLabel}>{t('Total Players')}</div>
                            {selectedCount === option.count && (
                                <div className={classes.checkmark}>
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                    </svg>
                                </div>
                            )}
                        </button>
                    ))}
                </div>

                <button id='continueBtn' className={classes.continueButton} onClick={handleContinue}>
                    <span>{t('Continue')}  ( 100 <Emoji id="coin" size="1rem" /> )</span>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                    </svg>
                </button>

                <div className={classes.infoBox}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                    </svg>
                    <p>{t('You will play against AI controlled bots')}</p>
                </div>
            </div>
        </div>
    );
};

export default VSComputerMode;
