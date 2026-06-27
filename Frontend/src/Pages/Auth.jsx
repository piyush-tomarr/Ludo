import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import classes from "./Auth.module.css";
import { signinWithNumberFun } from "../Services/ApiFun";
import useTranslate from "../Util/ChangeLang";

const Auth = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const t = useTranslate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState({
        phone: "",
        username: ""
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await signinWithNumberFun(formData.phone, formData.username);

            if (res.token) {
                localStorage.setItem("ludo_auth_token", res.token);
                localStorage.setItem("ludo_user", JSON.stringify(res.user));
                localStorage.setItem("ludo_player_name", res.user.username);
                const from = location.state?.from || "/menu";
                navigate(from, { replace: true });
            }
        } catch (err) {
            setError(err.message || t("Something went wrong. Please try again."));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={classes.container}>
            {/* Decorative Game Elements */}
            <div className={`${classes.decorativeElement} ${classes.pawn1}`}>
                <svg width="120" height="120" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="#f44336" />
                    <circle cx="50" cy="50" r="25" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="5" />
                </svg>
            </div>
            <div className={`${classes.decorativeElement} ${classes.pawn2}`}>
                <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="#4caf50" />
                    <circle cx="50" cy="50" r="25" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="5" />
                </svg>
            </div>
            <div className={`${classes.decorativeElement} ${classes.dice1}`}>
                <svg width="80" height="80" viewBox="0 0 100 100">
                    <rect width="80" height="80" rx="15" fill="#2196f3" transform="rotate(15)" />
                    <circle cx="40" cy="40" r="8" fill="white" />
                </svg>
            </div>
            <div className={`${classes.decorativeElement} ${classes.dice2}`}>
                <svg width="70" height="70" viewBox="0 0 100 100">
                    <rect width="70" height="70" rx="12" fill="#fad416" transform="rotate(-15)" />
                    <circle cx="20" cy="20" r="6" fill="white" />
                    <circle cx="50" cy="50" r="6" fill="white" />
                </svg>
            </div>

            <button className={classes.backButton} onClick={() => navigate("/menu")}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="24">
                    <path d="M19 12H5M5 12L12 19M5 12L12 5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            <div className={classes.authCard}>
                <h1 className={classes.title}>{t('GET STARTED')}</h1>
                <p className={classes.subtitle}>
                    {t('Enter your number to start playing Ethio Ludo!')}
                </p>

                {error && <div className={classes.error}>{error}</div>}

                <form className={classes.form} onSubmit={handleSubmit}>
                    <div className={classes.inputGroup}>
                        <label className={classes.label}>{t('Phone Number')}</label>
                        <input
                            type="tel"
                            name="phone"
                            placeholder={t("e.g. 0912345678")}
                            className={classes.input}
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className={classes.inputGroup}>
                        <label className={classes.label}>{t('Ludo Nickname (Optional)')}</label>
                        <input
                            type="text"
                            name="username"
                            placeholder={t("e.g. DiceKing99")}
                            className={classes.input}
                            value={formData.username}
                            onChange={handleInputChange}
                            disabled={isLoading}
                        />
                    </div>

                    <button type="submit" className={classes.authButton} disabled={isLoading}>
                        {isLoading ? t("LOADING...") : t("START PLAYING")}
                    </button>
                </form>

                <div className={classes.divider}>
                    <span>{t('Enjoy the Game')}</span>
                </div>

                <p className={classes.footerText}>
                    {t('By continuing, you agree to our Terms of Service.')}
                </p>
            </div>
        </div>
    );
};

export default Auth;
