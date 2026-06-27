import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaMinus, FaPlus, FaArrowLeft, FaQuestion } from 'react-icons/fa';
import logoImg from '../assets/lucky7.png';
import rollBtnImg from '../assets/RollDice.webp';
import classes from './Lucky7.module.css';
import { useSound } from '../context/SoundContext';
import useTranslate from '../Util/ChangeLang';

const Lucky7 = () => {
    const { initBgMusic, pauseBgMusic, resumeBgMusic } = useSound();
    const t = useTranslate();
    
    useEffect(() => {
        pauseBgMusic();
        return () => {
            resumeBgMusic();
        };
    }, [pauseBgMusic, resumeBgMusic]);


    const navigate = useNavigate();

    const location = useLocation();

    const [selectedOption, setSelectedOption] = useState(() => location.state?.selectedOption || '7');
    const [betAmount, setBetAmount] = useState(() => location.state?.betAmount || 500);
    const [showRules, setShowRules] = useState(false);

    const [history, setHistory] = useState(() => {
        if (location.state?.updatedHistory) return location.state.updatedHistory;
        const saved = localStorage.getItem('lucky7_history');
        if (saved) return JSON.parse(saved);
        return Array(7).fill(null);
    });

    const options = [
        { id: '2-6', label: t('2 TO 6'), multiplier: 2 },
        { id: '7', label: '7', multiplier: 3 },
        { id: '8-12', label: t('8 TO 12'), multiplier: 2 }
    ];

    useEffect(() => {
        if (location.state?.updatedHistory) {
            localStorage.setItem('lucky7_history', JSON.stringify(location.state.updatedHistory));
        }
    }, [location.state]);

    const handleRoll = () => {
        navigate('/lucky-7/rolling', {
            state: {
                selectedOption,
                betAmount,
                currentHistory: history
            }
        });
    };

    return (
        <div className={classes.lucky7Container}>
            {/* Top Bar */}
            <div className={classes.topBar}>
                <div className={classes.statGroup}>
                    <div className={classes.statPill}>
                        <span style={{ color: '#f1c40f' }}>💰</span> 41,820
                    </div>
                    <div className={classes.statPill}>
                        <span style={{ color: '#3498db' }}>💎</span> 222
                    </div>
                </div>
                <div className={classes.infoBtn} onClick={() => setShowRules(true)}>
                    <FaQuestion />
                </div>
            </div>

            {/* Marquee Header */}
            <div className={classes.marqueeHeader}>
                <img src={logoImg} alt="Lucky 7" className={classes.mainLogoImg} />
            </div>

            <h2 className={classes.selectOptionTitle}>{t('Select Option')}</h2>

            {/* Betting Cards */}
            <div className={classes.bettingOptions}>
                {options.map(opt => (
                    <div
                        key={opt.id}
                        className={`${classes.optionCard} ${selectedOption === opt.id ? classes.selected : ''}`}
                        onClick={() => setSelectedOption(opt.id)}
                    >
                        <div className={classes.multiplierTag}>{opt.multiplier}x</div>
                        <div className={classes.rangeText}>{opt.label}</div>
                        <div className={classes.indicator}>
                            <div className={classes.innerDot}></div>
                        </div>
                        <div className={classes.winLabel}>{t('Win')}</div>
                        <div className={classes.amountBox}>
                            <span style={{ color: '#f1c40f' }}>💰</span> {betAmount * opt.multiplier}
                        </div>
                    </div>
                ))}
            </div>

            {/* Bet Selector Area */}
            <div className={classes.betControl}>
                <div className={classes.controlLabel}>{t('Coins')}</div>
                <div className={classes.controlRow}>
                    <button className={classes.btnRound} onClick={() => setBetAmount(prev => Math.max(100, prev - 100))}>
                        <FaMinus />
                    </button>
                    <div className={classes.betVal}>
                        <span style={{ color: '#f1c40f' }}>💰</span> {betAmount}
                    </div>
                    <button className={classes.btnRound} onClick={() => setBetAmount(prev => prev + 100)}>
                        <FaPlus />
                    </button>
                </div>
            </div>

            {/* Roll Dice Button */}
            <div className={classes.rollBtnWrapper} onClick={handleRoll}>
                <img src={rollBtnImg} alt="Roll Dice" className={classes.rollBtnImage} />
                <div className={classes.limitBadge}>5</div>
            </div>

            {/* History Grid - 7 Slots */}
            <div className={classes.historyGrid}>
                {history.map((item, i) => (
                    <div
                        key={i}
                        className={`${classes.slot} ${item ? (item.isWin ? classes.winSlot : classes.lossSlot) : ''}`}
                    >
                        {item ? item.value : ''}
                    </div>
                ))}
            </div>

            {/* Back Button */}
            <div className={classes.footerArea}>
                <div className={classes.roundBack} onClick={() => navigate('/menu')}>
                    <FaArrowLeft />
                </div>
            </div>

            {/* Rules Modal */}
            {showRules && (
                <div className={classes.rulesOverlay} onClick={() => setShowRules(false)}>
                    <div className={classes.rulesModal} onClick={e => e.stopPropagation()}>
                        <h2>{t('How to Play')}</h2>
                        <ul className={classes.rulesList}>
                            <li className={classes.ruleItem}>
                                <span className={classes.ruleBullet}>1</span>
                                <div>{t('Choose one of the three betting options based on the total sum of two dice.')}</div>
                            </li>
                            <li className={classes.ruleItem}>
                                <span className={classes.ruleBullet}>2</span>
                                <div>{t('Adjust your coin bet amount using the plus and minus buttons.')}</div>
                            </li>
                            <li className={classes.ruleItem}>
                                <span className={classes.ruleBullet}>3</span>
                                <div>{t('Click "Roll Dice" to see the result. If the sum matches your range, you win!')}</div>
                            </li>
                        </ul>

                        <div className={classes.payoutTable}>
                            <div className={classes.payoutRow}>
                                <span className={classes.payoutLabel}>{t('Sum 2 to 6')}</span>
                                <span className={classes.payoutVal}>{t('2x Payout')}</span>
                            </div>
                            <div className={classes.payoutRow}>
                                <span className={classes.payoutLabel}>{t('Exact 7')}</span>
                                <span className={classes.payoutVal}>{t('3x Payout')}</span>
                            </div>
                            <div className={classes.payoutRow}>
                                <span className={classes.payoutLabel}>{t('Sum 8 to 12')}</span>
                                <span className={classes.payoutVal}>{t('2x Payout')}</span>
                            </div>
                        </div>

                        <button className={classes.closeRulesBtn} onClick={() => setShowRules(false)}>
                            {t('Understood')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Lucky7;
