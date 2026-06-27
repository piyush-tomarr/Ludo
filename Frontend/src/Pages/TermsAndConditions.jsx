import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import classes from './TermsAndConditions.module.css';
import { FaArrowLeft, FaGavel, FaGamepad, FaInfoCircle } from 'react-icons/fa';
import { useSound } from '../context/SoundContext';
import useTranslate from '../Util/ChangeLang';

const TermsAndConditions = () => {
    const navigate = useNavigate();
    const t = useTranslate();
    const { initBgMusic } = useSound();

    useEffect(() => {
        initBgMusic();
        window.scrollTo(0, 0);
    }, [initBgMusic]);

    const rules = [
        {
            id: 1,
            title: t('Fair Play'),
            desc: t('Any form of cheating or exploitation will lead to an immediate ban.')
        },
        {
            id: 2,
            title: t('Account Security'),
            desc: t('Users are responsible for their account credentials.')
        },
        {
            id: 3,
            title: t('Virtual Currency'),
            desc: t('Coins are for in-game use and have no real-world cash value outside the redemption platform.')
        },
        {
            id: 4,
            title: t('Community Conduct'),
            desc: t('Be respectful to other players in online matches.')
        }
    ];

    const howToPlay = [
        {
            id: 1,
            title: t('Objective'),
            desc: t('Move all four of your tokens to the finish (home) area before your opponents.')
        },
        {
            id: 2,
            title: t('Movement'),
            desc: t('Roll the dice to move tokens. A 6 is required to bring a token out of the starting area.')
        },
        {
            id: 3,
            title: t('Capturing'),
            desc: t("Landing on an opponent's token sends it back to their start.")
        },
        {
            id: 4,
            title: t('Safe Squares'),
            desc: t('Tokens on squares with icons are safe from being captured.')
        }
    ];

    return (
        <div className={classes.container}>
            <div className={classes.techBackground}></div>

            <button className={classes.backButton} onClick={() => navigate('/menu')}>
                <FaArrowLeft /> {t('Back')}
            </button>

            <div className={classes.contentWrapper}>
                <header className={classes.header}>
                    <h1 className={classes.title}>{t('Game Center')}</h1>
                    <p className={classes.subtitle}>{t('Legal Terms & Gameplay Rules')}</p>
                </header>

                {/* TERMS AND CONDITIONS */}
                <section className={classes.sectionCard}>
                    <div className={classes.sectionHeader}>
                        <FaGavel className={classes.sectionIcon} />
                        <h2 className={classes.sectionTitle}>{t('Terms & Conditions')}</h2>
                    </div>
                    <ul className={classes.ruleList}>
                        {rules.map(rule => (
                            <li key={rule.id} className={classes.ruleItem}>
                                <div className={classes.ruleNumber}>{rule.id}</div>
                                <div className={classes.ruleText}>
                                    <strong>{rule.title}</strong>
                                    <p>{rule.desc}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* HOW TO PLAY */}
                <section className={classes.sectionCard}>
                    <div className={classes.sectionHeader}>
                        <FaGamepad className={classes.sectionIcon} />
                        <h2 className={classes.sectionTitle}>{t('How to Play')}</h2>
                    </div>
                    <ul className={classes.ruleList}>
                        {howToPlay.map(step => (
                            <li key={step.id} className={classes.ruleItem}>
                                <div className={classes.ruleNumber}>{step.id}</div>
                                <div className={classes.ruleText}>
                                    <strong>{step.title}</strong>
                                    <p>{step.desc}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>

                {/* DISCLAIMER */}
                <section className={classes.sectionCard}>
                    <div className={classes.sectionHeader}>
                        <FaInfoCircle className={classes.sectionIcon} />
                        <h2 className={classes.sectionTitle}>{t('Disclaimer')}</h2>
                    </div>
                    <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>
                        {t('Ethio Ludo is intended for entertainment purposes only. Please play responsibly.')}
                    </p>
                </section>
            </div>
        </div>
    );
};

export default TermsAndConditions;
