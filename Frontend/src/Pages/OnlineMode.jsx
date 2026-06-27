import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import classes from './OnlineMode.module.css';
import { useSound } from '../context/SoundContext';
import { fetchProfileFun } from '../Services/ApiFun';
import useTranslate from '../Util/ChangeLang';
import Emoji from '../Components/Emoji';

const OnlineModeSelection = () => {
    const navigate = useNavigate();
    const { initBgMusic } = useSound();
    const t = useTranslate();
    const [userCoins, setUserCoins] = useState(0);

    useEffect(() => {
        initBgMusic();
        const user = JSON.parse(localStorage.getItem('ludo_user') || 'null');
        if (!user) {
            navigate('/auth', { state: { from: '/online-mode' }, replace: true });
            return;
        }
        fetchProfileFun(user.id).then(res => {
            setUserCoins(res.user.coins);
        }).catch(console.error);
    }, [initBgMusic, navigate]);

    const options = [
        {
            id: 'create',
            title: t('Create Game'),
            desc: t('Start a new room and invite your friends'),
            icon: '🏠',
            color: '#4caf50',
            path: '/online/create'
        },
        {
            id: 'join',
            title: t('Join Game'),
            desc: t('Enter a Room ID to join your friends'),
            icon: '🔗',
            color: '#2196f3',
            path: '/online/join'
        }
    ];

    return (
        <div className={classes.container}>
            <div className={classes.background}>
                <div className={classes.circle}></div>
                <div className={classes.circle}></div>
            </div>

            <button className={classes.backButton} onClick={() => navigate('/menu')}>
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
                    <h1 className={classes.title}>{t('Online Play')}</h1>
                    <p className={classes.subtitle}>{t('Choose how you want to play')}</p>
                </div>

                <div className={classes.optionsContainer}>
                    {options.map((opt) => (
                        <button
                            key={opt.id}
                            className={classes.optionCard}
                            onClick={() => navigate(opt.path)}
                            style={{ '--card-color': opt.color }}
                        >
                            <div className={classes.iconContainer}>
                                <span className={classes.emoji}>{opt.icon}</span>
                            </div>
                            <div className={classes.optTitle}>{opt.title}</div>
                            <div className={classes.optDesc}>{opt.desc}</div>
                        </button>
                    ))}
                </div>

                <div className={classes.infoBox}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                    </svg>
                    <p>{t('Playing online requires a stable internet connection')}</p>
                </div>
            </div>
        </div>
    );
};

export default OnlineModeSelection;
