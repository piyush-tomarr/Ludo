import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import classes from "./Signup.module.css";
import { signupFun, googleAuthFun } from "../Services/ApiFun";
import useTranslate from "../Util/ChangeLang";

const Signup = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const t = useTranslate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: ""
    });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (error) setError("");
    };

    const persistSession = (res) => {
        localStorage.setItem("ludo_auth_token", res.token);
        localStorage.setItem("ludo_user", JSON.stringify(res.user));
        localStorage.setItem("ludo_player_name", res.user.username);
        const from = location.state?.from || "/menu";
        navigate(from, { replace: true });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const res = await signupFun(formData.username, formData.email, formData.password);
            if (res.token) persistSession(res);
        } catch (err) {
            setError(err.message || t("Something went wrong. Please try again."));
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsLoading(true);
        setError("");

        try {
            const res = await googleAuthFun(credentialResponse.credential);
            if (res.token) persistSession(res);
        } catch (err) {
            setError(err.message || t("Google sign-in failed. Please try again."));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={classes.container}>
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
                <h1 className={classes.title}>{t("CREATE ACCOUNT")}</h1>
                <p className={classes.subtitle}>
                    {t("Sign up with your email to start playing Ethio Ludo!")}
                </p>

                {error && <div className={classes.error}>{error}</div>}

                <form className={classes.form} onSubmit={handleSubmit}>
                    <div className={classes.inputGroup}>
                        <label className={classes.label}>{t("Username")}</label>
                        <input
                            type="text"
                            name="username"
                            placeholder={t("e.g. DiceKing99")}
                            className={classes.input}
                            value={formData.username}
                            onChange={handleInputChange}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className={classes.inputGroup}>
                        <label className={classes.label}>{t("Email")}</label>
                        <input
                            type="email"
                            name="email"
                            placeholder={t("e.g. player@example.com")}
                            className={classes.input}
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className={classes.inputGroup}>
                        <label className={classes.label}>{t("Password")}</label>
                        <div className={classes.passwordWrapper}>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder={t("Enter your password")}
                                className={classes.input}
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                className={classes.eyeToggle}
                                onClick={() => setShowPassword((prev) => !prev)}
                                disabled={isLoading}
                                aria-label={showPassword ? t("Hide password") : t("Show password")}
                            >
                                {showPassword ? (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17.94 17.94A10.94 10.94 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A10.94 10.94 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" strokeLinecap="round" strokeLinejoin="round" />
                                        <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                                    </svg>
                                ) : (
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
                                        <circle cx="12" cy="12" r="3" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className={classes.authButton} disabled={isLoading}>
                        {isLoading ? t("LOADING...") : t("CREATE ACCOUNT")}
                    </button>
                </form>

                {/* <div className={classes.divider}>
                    <span>{t("OR")}</span>
                </div> */}

                <div className={classes.googleButtonWrapper}>
                    <GoogleSignInButton onSuccess={handleGoogleSuccess} disabled={isLoading} t={t} />
                </div>

                <p className={classes.switchModeText}>
                    {t("Already have an account?")}{" "}
                    <button type="button" className={classes.switchModeButton} onClick={() => navigate("/auth")}>
                        {t("Log in")}
                    </button>
                </p>

                <p className={classes.footerText}>
                    {t("By continuing, you agree to our Terms of Service.")}
                </p>
            </div>
        </div>
    );
};

const GoogleSignInButton = ({ onSuccess, disabled, t }) => {
    const handleClick = () => {
        if (disabled) return;

        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

        if (!clientId) {
            console.error("VITE_GOOGLE_CLIENT_ID is not set in your .env file.");
            return;
        }

        if (!window.google || !window.google.accounts) {
            console.error("Google Identity Services script not loaded. Make sure <script src=\"https://accounts.google.com/gsi/client\"> is in index.html.");
            return;
        }

        window.google.accounts.id.initialize({
            client_id: clientId,
            callback: onSuccess
        });
        window.google.accounts.id.prompt();
    };

    // return (
    //     <button
    //         type="button"
    //         className={classes.googleButton}
    //         onClick={handleClick}
    //         disabled={disabled}
    //     >
    //         <svg width="18" height="18" viewBox="0 0 18 18">
    //             <path
    //                 fill="#4285F4"
    //                 d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84c-.21 1.12-.84 2.07-1.8 2.71v2.26h2.9c1.7-1.57 2.7-3.88 2.7-6.61z"
    //             />
    //             <path
    //                 fill="#34A853"
    //                 d="M9 18c2.43 0 4.47-.81 5.96-2.18l-2.9-2.26c-.8.55-1.84.86-3.06.86-2.35 0-4.34-1.58-5.05-3.72H.96v2.34C2.44 15.98 5.48 18 9 18z"
    //             />
    //             <path
    //                 fill="#FBBC05"
    //                 d="M3.95 10.7c-.18-.55-.28-1.13-.28-1.7s.1-1.15.28-1.7V4.96H.96A8.96 8.96 0 000 9c0 1.45.35 2.83.96 4.04l2.99-2.34z"
    //             />
    //             <path
    //                 fill="#EA4335"
    //                 d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.99 2.34C4.66 5.16 6.65 3.58 9 3.58z"
    //             />
    //         </svg>
    //         {t("Continue with Google")}
    //     </button>
    // );
};

export default Signup;