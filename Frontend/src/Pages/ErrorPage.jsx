import React from "react";
import { useNavigate, useRouteError } from "react-router-dom";
import classes from "./ErrorPage.module.css";

const ErrorPage = () => {
    const error = useRouteError();
    const navigate = useNavigate();
    console.error(error);

    return (
        <div className={classes.container}>
            <div className={classes.errorCard}>
                <span className={classes.diceWrapper}>🎲</span>
                <h1 className={classes.title}>Oops! 404</h1>
                <p className={classes.subtitle}>
                    {(error?.statusText || error?.message) || "This path is a dead end. Let's roll back to safety!"}
                </p>
                <button className={classes.homeButton} onClick={() => navigate("/")}>
                    BACK TO MENU
                </button>
            </div>
        </div>
    );
};

export default ErrorPage;
