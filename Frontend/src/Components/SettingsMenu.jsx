import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { changeLanguage } from '../Slices/LanguageSlice';
import { useSound } from '../context/SoundContext';
import useTranslate from '../Util/ChangeLang';
import classes from './SettingsMenu.module.css';
import { IoMusicalNotesOutline, IoTrophyOutline, IoWalletOutline, IoLogOutOutline, IoLanguageOutline, IoPersonOutline, IoVolumeMuteOutline } from 'react-icons/io5';

const SettingsMenu = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const t = useTranslate();
    const { isMusicMuted, isSfxMuted, toggleMusic, toggleSfx } = useSound();
    const currentLangId = useSelector((state) => state.language.lang);
    const loggedUser = JSON.parse(localStorage.getItem("ludo_user") || "null");

    if (!isOpen) return null;

    const handleLanguageToggle = (e) => {
        e.stopPropagation();
        const nextLang = currentLangId === 'en' ? 'am' : 'en';
        dispatch(changeLanguage(nextLang));
    };

    const handleNavigate = (path) => {
        onClose();
        navigate(path);
    };

    const handleLogout = (e) => {
        e.stopPropagation();
        localStorage.removeItem("ludo_user");
        localStorage.removeItem("ludo_player_name");
        onClose();
        navigate('/auth');
    };

    return (
        <div className={classes.floatingWrapper} onClick={onClose}>
            <div className={classes.menuList} onClick={e => e.stopPropagation()}>
                {/* Music Option */}
                <div className={classes.menuItem} onClick={(e) => { e.stopPropagation(); toggleMusic(); }}>
                    <div className={classes.itemIcon}>
                        {isMusicMuted ? <IoVolumeMuteOutline /> : <IoMusicalNotesOutline />}
                    </div>
                    <div className={classes.itemLabel}>
                        {t('Music')}: <span className={isMusicMuted ? classes.offText : classes.onText}>{isMusicMuted ? t('OFF') : t('ON')}</span>
                    </div>
                </div>

                {/* Language Option */}
                <div className={classes.menuItem} onClick={handleLanguageToggle}>
                    <div className={classes.itemIcon}><IoLanguageOutline /></div>
                    <div className={classes.itemLabel}>
                        {currentLangId === 'en' ? t('English') : t('Amharic')}
                    </div>
                    <div className={classes.flagMini}>{currentLangId === 'en' ? '🇺🇸' : '🇪🇹'}</div>
                </div>

                {/* Redeem Option */}
                <div className={classes.menuItem} onClick={(e) => { e.stopPropagation(); handleNavigate('/redeem'); }}>
                    <div className={classes.itemIcon}><IoWalletOutline /></div>
                    <div className={classes.itemLabel}>{t('Redeem')}</div>
                </div>

                {/* Leaderboard Option */}
                <div className={classes.menuItem} onClick={(e) => { e.stopPropagation(); handleNavigate('/leaderboard'); }}>
                    <div className={classes.itemIcon}><IoTrophyOutline /></div>
                    <div className={classes.itemLabel}>{t('Leaderboard')}</div>
                </div>

                {/* Profile Option */}
                <div className={classes.menuItem} onClick={(e) => { e.stopPropagation(); handleNavigate('/profile'); }}>
                    <div className={classes.itemIcon}><IoPersonOutline /></div>
                    <div className={classes.itemLabel}>{t('Profile')}</div>
                </div>

                {/* Logout Option */}
                {loggedUser && (
                    <div className={`${classes.menuItem} ${classes.logoutItem}`} onClick={handleLogout}>
                        <div className={classes.itemIcon}><IoLogOutOutline /></div>
                        <div className={classes.itemLabel}>{t('Logout')}</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SettingsMenu;
