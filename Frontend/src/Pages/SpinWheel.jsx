import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaTimes, FaCoins, FaPlay } from 'react-icons/fa';
import classes from './SpinWheel.module.css';
import { spinApi } from '../Services/api';
import { useSound } from '../context/SoundContext';
import useTranslate from '../Util/ChangeLang';

const SpinWheel = () => {
    const navigate = useNavigate();
    const { pauseBgMusic, resumeBgMusic } = useSound();
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [showReward, setShowReward] = useState(false);
    const [rewardData, setRewardData] = useState({ value: 0, type: 'coins' });
    const [canSpin, setCanSpin] = useState(true);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const t = useTranslate();

    useEffect(() => {
        pauseBgMusic();
        return () => {
            resumeBgMusic();
        };
    }, [pauseBgMusic, resumeBgMusic]);

    useEffect(() => {
        const loggedUser = JSON.parse(localStorage.getItem('ludo_user') || 'null');
        if (loggedUser) {
            setUser(loggedUser);
            checkSpinStatus(loggedUser.id);
        } else {
            setLoading(false);
        }
    }, []);

    const checkSpinStatus = async (userId) => {
        try {
            const response = await fetch(`${spinApi}/status/${userId}`);
            const data = await response.json();
            setCanSpin(data.canSpin);
        } catch (error) {
            console.error("Error checking spin status:", error);
        } finally {
            setLoading(false);
        }
    };

    const segments = [
        { value: 100, type: 'coins', color: '#3498db' },
        { value: 500, type: 'coins', color: '#f1c40f' },
        { value: 0, type: 'coins', color: '#2980b9' },
        { value: 2000, type: 'coins', color: '#f1c40f' },
        { value: '☹️', type: 'bad_luck', color: '#3498db', label: 'Better luck next time' },
        { value: 1000, type: 'coins', color: '#f1c40f' },
        { value: 750, type: 'coins', color: '#2980b9' },
        { value: 5000, type: 'coins', color: '#f1c40f' },
        { value: 200, type: 'coins', color: '#f1c40f' },
        { value: '🤩', type: 'spin_again', color: '#2980b9', label: 'Spin Again!' }
    ];

    const spin = () => {
        if (isSpinning || !canSpin) return;

        setIsSpinning(true);
        setShowReward(false);

        const extraDegrees = Math.floor(Math.random() * 360);
        const totalSpins = 8 + Math.floor(Math.random() * 5);
        const newRotation = rotation + (totalSpins * 360) + extraDegrees;

        setRotation(newRotation);

        setTimeout(async () => {
            setIsSpinning(false);
            
            let normalizedRotation = (newRotation % 360);
            const segmentAngle = 360 / segments.length;
            
            let pointerAngle = 270; 
            let rewardIndex = Math.round(((pointerAngle - normalizedRotation + 360) % 360) / segmentAngle);
            rewardIndex = rewardIndex % segments.length; 
            
            const winningSegment = segments[rewardIndex];
            const reward = { 
                value: winningSegment.value, 
                type: winningSegment.type,
                label: winningSegment.label || `${winningSegment.value} Coins`
            };
            
            setRewardData(reward);
            setShowReward(true);

            // Save to DB if it's a valid reward or even bad luck (to count as daily spin)
            if (user) {
                await claimReward(reward);
            }
        }, 6000); 
    };

    const claimReward = async (reward) => {
        try {
            const response = await fetch(`${spinApi}/claim`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    rewardType: reward.type,
                    rewardAmount: typeof reward.value === 'number' ? reward.value : 0
                })
            });
            const data = await response.json();
            if (response.ok) {
                setCanSpin(false);
                // Update local storage coins if needed, or just let next refresh handle it
                const updatedUser = { ...user, coins: (user.coins || 0) + (typeof reward.value === 'number' ? reward.value : 0) };
                localStorage.setItem('ludo_user', JSON.stringify(updatedUser));
                setUser(updatedUser);
            }
        } catch (error) {
            console.error("Error claiming reward:", error);
        }
    };

    const handleClose = () => setShowReward(false);


    return (
        <div className={classes.spinWheelContainer}>
            <div className={classes.backButton} onClick={() => navigate('/menu')}>
                <FaArrowLeft style={{ color: '#fff' }} />
            </div>

            <h1 className={classes.title}>{t('Wheel of Coins')}</h1>

            <div className={classes.wheelWrapper}>
                <div className={classes.pointer}>
                    <span>{t('Tap')}</span>
                </div>

                <div className={classes.lightsRing}></div>

                <div 
                    className={classes.wheelOuter} 
                    style={{ transform: `rotate(${rotation}deg)` }}
                >
                    <div className={classes.wheelSegments}>
                        {segments.map((seg, i) => {
                            const angle = i * (360 / segments.length);
                            return (
                                <div 
                                    key={i} 
                                    className={classes.segment} 
                                    style={{ 
                                        transform: `rotate(${angle}deg)`,
                                        backgroundColor: seg.color
                                    }}
                                >
                                    <div className={classes.segmentContent} style={{ fontSize: typeof seg.value === 'string' ? '2.2rem' : '1.4rem' }}>
                                        {seg.value}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div 
                    className={`${classes.spinButton} ${(!canSpin || loading) ? classes.disabledSpin : ''}`} 
                    onClick={spin}
                >
                    <span className={classes.spinButtonText}>
                        {loading ? '...' : canSpin ? t('SPIN') : t('DONE')}
                    </span>
                </div>
            </div>

            {!canSpin && !loading && (
                <div className={classes.spinLimitMsg}>
                    {t("You've already spun today! Come back tomorrow.")}
                </div>
            )}


            <button className={classes.premiumSpinBtn}>
                {t('Premium Spin')}
            </button>

            {showReward && (
                <div className={classes.rewardModal}>
                    <div className={`${classes.modalContent} ${rewardData.type !== 'coins' && rewardData.type !== 'spin_again' ? classes.modalNotWon : ''}`}>
                        <div className={classes.closeButton} onClick={handleClose}>
                            <FaTimes />
                        </div>

                        <div className={classes.modalHeader}>
                            <div className={classes.crown}>👑</div>
                            <div className={classes.ribbon}>
                                {rewardData.type === 'coins' ? t('You Won!') : rewardData.type === 'spin_again' ? t('Lucky!') : t('Oops!')}
                            </div>
                        </div>

                        <div className={classes.rewardBody}>
                            <div className={classes.coinsStack}>
                                {rewardData.type === 'coins' ? '💰' : rewardData.type === 'spin_again' ? '🤩' : '☹️'}
                            </div>
                            
                            <div className={classes.sparkle} style={{ top: '10%', left: '20%' }}>✨</div>
                            <div className={classes.sparkle} style={{ top: '30%', right: '15%' }}>✨</div>
                            <div className={classes.sparkle} style={{ bottom: '20%', left: '10%' }}>✨</div>

                            <div className={classes.rewardText}>
                                {rewardData.type === 'coins' ? (
                                    <>{rewardData.value} <span>{t('Coins')}</span></>
                                ) : rewardData.type === 'spin_again' ? (
                                    t('Free Spin')
                                ) : (
                                    <span style={{ fontSize: '2.4rem' }}>{t('Better luck next time')}</span>
                                )}
                            </div>
                        </div>

                        <div className={classes.modalFooter}>
                            {rewardData.type === 'bad_luck' ? (
                                <button className={`${classes.modalBtn} ${classes.btnCollect}`} onClick={() => navigate('/menu')}>
                                    <FaCoins /> {t('BACK TO HOME')}
                                </button>
                            ) : (
                                <>
                                    <button className={`${classes.modalBtn} ${classes.btnCollect}`} onClick={handleClose}>
                                        <FaCoins /> {rewardData.type === 'coins' ? t('Collect Coins') : t('Spin Now')}
                                    </button>
                                    <button className={`${classes.modalBtn} ${classes.btnAgain}`} onClick={handleClose}>
                                        <FaPlay /> {t('Play Again')}
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpinWheel;
