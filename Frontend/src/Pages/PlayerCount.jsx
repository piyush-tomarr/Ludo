import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classes from './PlayerCount.module.css';
import { useSound } from '../context/SoundContext';
import useTranslate from '../Util/ChangeLang';

const PlayerCount = () => {
    const navigate = useNavigate();
    const { initBgMusic } = useSound();
    const t = useTranslate();

    useEffect(() => {
        initBgMusic();
    }, [initBgMusic]);
    const [selectedCount, setSelectedCount] = useState(4);

    const handleContinue = () => {
        navigate('/setup-players', { state: { playerCount: selectedCount, isLocalGame: true } });
    };

    const playerOptions = [
        { count: 2, color: '#2196f3', icon: '👥' },
        { count: 3, color: '#2196f3', icon: '👥👤' },
        { count: 4, color: '#2196f3', icon: '👥👥' }
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

                {/* Header */}
                <div className={classes.header}>
                    <h1 className={classes.title}>{t('Select Players')}</h1>
                    <p className={classes.subtitle}>{t('How many players will be playing?')}</p>
                </div>

                {/* Player Count Options */}
                <div className={classes.optionsContainer}>
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
                            <div className={classes.countLabel}>{t('Players')}</div>
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

                {/* Continue Button */}
                <button className={classes.continueButton} onClick={handleContinue}>
                    <span>{t('Continue')}</span>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                    </svg>
                </button>

                {/* Info */}
                <div className={classes.infoBox}>
                    <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                    </svg>
                    <p>{t('Each player will take turns on the same device')}</p>
                </div>
            </div>
        </div>
    );
};

export default PlayerCount;
