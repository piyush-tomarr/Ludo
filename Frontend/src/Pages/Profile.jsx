// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import Avatar from "react-avatar";
// import classes from "./Profile.module.css";
// import { fetchProfileFun, deductCoinsFun } from "../Services/ApiFun";
// import useTranslate from "../Util/ChangeLang";

// const Profile = () => {
//     const navigate = useNavigate();
//     const t = useTranslate();
//     const [userStats, setUserStats] = useState(null);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState("");
//     const [isRedeeming, setIsRedeeming] = useState(false);
//     const [selectedAvatar, setSelectedAvatar] = useState(null);
//     const [newUsername, setNewUsername] = useState('');
//     useEffect(() => {
//         const loadProfile = async () => {
//             const loggedUser = JSON.parse(localStorage.getItem("ludo_user") || "null");
//             if (!loggedUser || !loggedUser.id) {
//                 navigate("/auth");
//                 return;
//             }

//             try {
//                 const res = await fetchProfileFun(loggedUser.id);
//                 setUserStats(res.user);
//             } catch (err) {
//                 setError(t("Something went wrong. Please try again."));
//                 console.error(err);
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//         loadProfile();
//     }, [navigate, t]);

//     const handleLogout = () => {
//         localStorage.removeItem("ludo_auth_token");
//         localStorage.removeItem("ludo_user");
//         localStorage.removeItem("ludo_player_name");
//         navigate("/");
//     };

//     const handleRedeem = async (coinsToDeduct, usdAmount) => {
//         if (!userStats || userStats.coins < coinsToDeduct) {
//             alert(t('Insufficient Coins! Keep playing to earn more.'));
//             return;
//         }

//         setIsRedeeming(true);
//         try {
//             await deductCoinsFun(userStats.id, coinsToDeduct);
//             setUserStats(prev => ({ ...prev, coins: prev.coins - coinsToDeduct }));
//             alert(`${t('Successfully redeemed')} ${usdAmount} USD! ${t('Details have been sent to your email.')}`);
//             setShowRedeemModal(false);
//         } catch (err) {
//             alert(t('Redemption failed. Please try again.'));
//             console.error(err);
//         } finally {
//             setIsRedeeming(false);
//         }
//     };

//     if (isLoading) {
//         return (
//             <div className={classes.container}>
//                 <div className={classes.loading}>{t('Loading Master Profile...')}</div>
//             </div>
//         );
//     }

//     const winRate = userStats ? ((userStats.wins / (userStats.total_games || 1)) * 100).toFixed(1) : 0;

//    let avtarImages = [
//     {image:'/avtar1.png',alt:"Avtar 1"},
//     {image:'/avtar2.png',alt:"Avtar 2"},
//     {image:'/avtar3.png',alt:"Avtar 3"},
//     {image:'/avtar4.png',alt:"Avtar 4"},
//     {image:'/avtar5.png',alt:"Avtar 5"},
//    ]
   

//     return (
//         <div className={classes.container}>
//             {/* Top Branding Section */}
//             <button className={classes.backButton} onClick={() => navigate("/menu")}>
//                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="22">
//                     <path d="M19 12H5M5 12L12 19M5 12L12 5" strokeLinecap="round" strokeLinejoin="round" />
//                 </svg>
//                 <span>{t('Back')}</span>
//             </button>
//             <div className={classes.brandingHeader}>
//                 <h1 className={classes.titleMain}>{t('ETHIO LUDO')}</h1>
//             </div>

//             <div className={classes.profileWrapper}>
//                 {/* 👑 Identity Section */}
//                 <div className={classes.heroPart}>
//                     <div className={classes.avatarGlow}>
//                         <div className={classes.avatarFrame}>
//                             <Avatar
//                                 name={userStats?.username || t("Ludo Champ")}
//                                 round={true}
//                                 size="100%"
//                                 src={userStats?.avatar}
//                                 color={Avatar.getRandomColor('sitebase', ['#f44336', '#4caf50', '#2196f3', '#fad416'])}
//                             />
                      
//                         </div>
//                     </div>
                    
//                     <div className={classes.identityInfo}>
//                         <h2 className={classes.username}>{userStats?.username || t("Ludo Champ")}</h2>
//                         <span className={classes.uidText}>{t('UID')}: #{String(userStats?.id || 0).padStart(5, '0')}</span>
//                     </div>
//                 </div>

//                 <div className={classes.walletItems}>
//                     <div className={classes.walletItem}>
//                         <span className={classes.walletIcon}>🪙</span>
//                         <span className={classes.walletValue}>{userStats?.coins?.toLocaleString() || 0}</span>
//                     </div>
//                     <div className={classes.walletItem}>
//                         <span className={classes.walletIcon}>💎</span>
//                         <span className={classes.walletValue}>0</span>
//                     </div>



//                 </div>
             
               

// <div id="editProfile" className={classes.editProfile}>
     
//      <h1>Edit Profile</h1>


//     <h2>Select Avatar</h2>
//     <div id="avatars" className={classes.AvtarSec}>
        
//         {avtarImages.map((e, index) => {
//             return (
//                 <div
//                     key={index}
//                     className={`${classes.avtar} ${selectedAvatar === index ? classes.selected : ''}`}
//                     onClick={() => setSelectedAvatar(index)}
//                 >
//                     <img src={e.image} alt={e.alt} />
//                 </div>
//             )
//         })}
//     </div>

//     <div id="update" className={classes.updateSection}>
//     <h2 className={classes.updateTitle}>Edit Username</h2>
//     <div className={classes.inputWrapper}>
//         <input
//             type="text"
//             className={classes.usernameInput}
//             defaultValue={userStats?.username || ''}
//             placeholder="Enter new username"
//         />
//     </div>
//     <button className={classes.updateBtn}>UPDATE</button>
// </div>
// </div>
        

//                 {/* 📊 Central Ludo Stats Grid */}
//                 <div className={classes.mainStatsArea}>
//                     <div className={classes.bigStatBox}>
//                         <span className={classes.bigVal}>{userStats?.wins || 0}</span>
//                         <span className={classes.bigLabel}>{t('Total Wins')}</span>
//                     </div>
//                     <div className={classes.statsLine}>
//                         <div className={classes.smallStat}>
//                             <span className={classes.sVal}>{userStats?.total_games || 0}</span>
//                             <span className={classes.sLabel}>{t('Games')}</span>
//                         </div>
//                         <div className={classes.devider}></div>
//                         <div className={classes.smallStat}>
//                             <span className={classes.sVal}>{winRate}%</span>
//                             <span className={classes.sLabel}>{t('Win Rate')}</span>
//                         </div>
//                         <div className={classes.devider}></div>
//                         <div className={classes.smallStat}>
//                             <span className={classes.sVal}>{userStats?.losses || 0}</span>
//                             <span className={classes.sLabel}>{t('Loss')}</span>
//                         </div>
//                     </div>
//                 </div>

//                 <div className={classes.bottomActions}>
//                     <button className={classes.redeemBtn} onClick={() => navigate("/redeem")}>{t('REDEEM COINS')}</button>
//                     <button className={classes.signoutBtn} onClick={handleLogout}>{t('SIGN OUT')}</button>
//                     <button className={classes.menuBtn} onClick={() => navigate("/menu")}>{t('BACK TO MENU')}</button>
//                 </div>
//             </div>

//             {/* Legacy modal removed */}
//         </div>
//     );
// };

// export default Profile;






// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import Avatar from "react-avatar";
// import classes from "./Profile.module.css";
// import { fetchProfileFun, deductCoinsFun } from "../Services/ApiFun";
// import useTranslate from "../Util/ChangeLang";
// import axios from "axios";
// import {baseUrl1} from '../Services/api'
// const Profile = () => {
//     const navigate = useNavigate();
//     const t = useTranslate();
//     const [userStats, setUserStats] = useState(null);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState("");
//     const [isRedeeming, setIsRedeeming] = useState(false);
//     const [selectedAvatar, setSelectedAvatar] = useState(null);
//     const [newUsername, setNewUsername] = useState('');
//     const [isUpdating, setIsUpdating] = useState(false);
//     const [updateMsg, setUpdateMsg] = useState('');
//     const [gender, setgender] = useState('male')
//     const avtarImages = [
//         { image: '/avtar1.png', alt: "Avatar 1" },
//         { image: '/avtar2.png', alt: "Avatar 2" },
//         { image: '/avtar3.png', alt: "Avatar 3" },
//         { image: '/avtar4.png', alt: "Avatar 4" },
//         { image: '/avtar5.png', alt: "Avatar 5" },
//     ];


//       const videoRef = useRef(null);

// useEffect(() => {
//     const startCamera = async () => {
//         try {
//             const stream = await navigator.mediaDevices.getUserMedia({ video: true });
//             if (videoRef.current) {
//                 videoRef.current.srcObject = stream;
//             }
//         } catch (err) {
//             console.error("Camera access denied:", err);
//         }
//     };

//     startCamera();

//     return () => {
//         // Cleanup: stop camera when modal closes
//         if (videoRef.current?.srcObject) {
//             videoRef.current.srcObject.getTracks().forEach(track => track.stop());
//         }
//     };
// }, []);
    
//         const loadProfile = async () => {
//             const loggedUser = JSON.parse(localStorage.getItem("ludo_user") || "null");
//             console.log(loggedUser,"this is the logged user")
//             if (!loggedUser || !loggedUser.id) {
//                 navigate("/auth");
//                 return;
//             }
//             try {
//                 const res = await fetchProfileFun(loggedUser.id);
//                 setUserStats(res.user);
//                 setNewUsername(res.user?.username || '');
//                 console.log("this is response userstats" , res.user)
//                 const updatedUser = { ...loggedUser, ...res.user }
//                 localStorage.setItem("ludo_user" , JSON.stringify(updatedUser))
//                 // pre-select avatar if user already has one
//                 const existingIndex = avtarImages.findIndex(a => a.image === res.user?.avatar);
//                 if (existingIndex !== -1) setSelectedAvatar(existingIndex);

//             } catch (err) {
//                 setError(t("Something went wrong. Please try again."));
//                 console.error(err);
//             } finally {
//                 setIsLoading(false);
//             }
//         };

//      useEffect(() => {
//         loadProfile();
//     }, [navigate, t]);

//     const handleLogout = () => {
//         localStorage.removeItem("ludo_auth_token");
//         localStorage.removeItem("ludo_user");
//         localStorage.removeItem("ludo_player_name");
//         navigate("/");
//     };

//     const handleRedeem = async (coinsToDeduct, usdAmount) => {
//         if (!userStats || userStats.coins < coinsToDeduct) {
//             alert(t('Insufficient Coins! Keep playing to earn more.'));
//             return;
//         }
//         setIsRedeeming(true);
//         try {
//             await deductCoinsFun(userStats.id, coinsToDeduct);
//             setUserStats(prev => ({ ...prev, coins: prev.coins - coinsToDeduct }));
//             alert(`${t('Successfully redeemed')} ${usdAmount} USD! ${t('Details have been sent to your email.')}`);
//         } catch (err) {
//             alert(t('Redemption failed. Please try again.'));
//             console.error(err);
//         } finally {
//             setIsRedeeming(false);
//         }
//     };

//     let handleUpdate = async () => {
//         if (!userStats?.id) return;
//         if (!newUsername.trim() && selectedAvatar === null) {
//             setUpdateMsg('Nothing to update!');
//             return;
//         }

//         setIsUpdating(true);
//         setUpdateMsg('');

//         try {
//             const formData = new FormData();
//             formData.append('id', userStats.id);

//             // only append if changed
//             if (newUsername.trim() && newUsername.trim() !== userStats.username) {
//                 formData.append('username', newUsername.trim());
//             }

//             if (selectedAvatar !== null) {
//                 // fetch the image from public folder and convert to file
//                 const avatarPath = avtarImages[selectedAvatar].image;
//                 const response = await fetch(avatarPath);
//                 const blob = await response.blob();
//                 const file = new File([blob], `avatar${selectedAvatar + 1}.png`, { type: 'image/png' });
//                 formData.append('avatar', file);
//             }

//             await axios.post(
//                 `${baseUrl1}/users/edit-profile`,
//                 formData,
//                 { headers: { 'Content-Type': 'multipart/form-data' } }
//             );

//             // update local state
//             setUserStats(prev => ({
//                 ...prev,
//                 username: newUsername.trim() || prev.username,
//                 avatar: selectedAvatar !== null ? avtarImages[selectedAvatar].image : prev.avatar,
//             }));

//             // update localStorage
//             const loggedUser = JSON.parse(localStorage.getItem("ludo_user") || "null");
//             if (loggedUser) {
//                 loggedUser.username = newUsername.trim() || loggedUser.username;
//                 localStorage.setItem("ludo_user", JSON.stringify(loggedUser));
//             }

//             setUpdateMsg('✅ Profile updated successfully!');
//             loadProfile()
//         } catch (err) {
//             console.error(err);
//             setUpdateMsg('❌ Update failed. Please try again.');
//         } finally {
//             setIsUpdating(false);
//         }
//     };

//     if (isLoading) {
//         return (
//             <div className={classes.container}>
//                 <div className={classes.loading}>{t('Loading Master Profile...')}</div>
//             </div>
//         );
//     }

//     const winRate = userStats
//         ? ((userStats.wins / (userStats.total_games || 1)) * 100).toFixed(1)
//         : 0;

//     return (
//         <>
//         <div className={classes.container} >
//             <button className={classes.backButton} onClick={() => navigate("/menu")}>
//                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="22">
//                     <path d="M19 12H5M5 12L12 19M5 12L12 5" strokeLinecap="round" strokeLinejoin="round" />
//                 </svg>
//                 <span>{t('Back')}</span>
//             </button>

//             <div className={classes.brandingHeader}>
//                 <h1 className={classes.titleMain}>{t('ETHIO LUDO')}</h1>
//             </div>

//             <div className={classes.profileWrapper}>

//                 {/* 👑 Identity Section */}
//                 <div className={classes.heroPart}>
//                     <div className={classes.avatarGlow}>
//                         <div className={classes.avatarFrame}>
//                             <div id="overlayImage" className={classes.overlayimage}>
//                                  <Avatar
//                                 name={userStats?.username || t("Ludo Champ")}
//                                 round={true}
//                                 size="100%"
//                                 src={userStats?.avatar ? `${baseUrl1}${userStats.avatar}` : null}
//                                 color={Avatar.getRandomColor('sitebase', ['#f44336', '#4caf50', '#2196f3', '#fad416'])}
//                             />
//                             </div>
                           
//                         </div>
//                     </div>
//                     <div className={classes.identityInfo}>
//                         <h2 className={classes.username}>{userStats?.username || t("Ludo Champ")}</h2>
//                         <span className={classes.uidText}>{t('UID')}: #{String(userStats?.id || 0).padStart(5, '0')}</span>
//                     </div>
//                 </div>

//                 {/* 💰 Wallet */}
//                 <div className={classes.walletItems}>
//                     <div className={classes.walletItem}>
//                         <span className={classes.walletIcon}>🪙</span>
//                         <span className={classes.walletValue}>{userStats?.coins?.toLocaleString() || 0}</span>
//                     </div>
//                     <div className={classes.walletItem}>
//                         <span className={classes.walletIcon}>💎</span>
//                         <span className={classes.walletValue}>0</span>
//                     </div>
//                 </div>

//                 {/* ✏️ Edit Profile */}
//                 <div className={classes.editProfile}>
//                     <h1 className={classes.editTitle}>Edit Profile</h1>

//                     <h2 className={classes.updateTitle}>Select Avatar</h2>
//                     <div className={classes.AvtarSec}>
//                         {avtarImages.map((e, index) => (
//                             <div
//                                 key={index}
//                                 className={`${classes.avtar} ${selectedAvatar === index ? classes.selected : ''}`}
//                                 onClick={() => setSelectedAvatar(index)}
//                             >
//                                 <img src={e.image} alt={e.alt} />
//                             </div>
//                         ))}
//                     </div>

//                     <div className={classes.updateSection}>
//                         <h2 className={classes.updateTitle}>Edit Username</h2>
//                         <div className={classes.inputWrapper}>
//                             <input
//                                 type="text"
//                                 className={classes.usernameInput}
//                                 value={newUsername}
//                                 onChange={(e) => setNewUsername(e.target.value)}
//                                 placeholder="Enter new username"
//                             />
//                         </div>


//                         <h2 className={classes.updateTitle}>Update Gender</h2>
//                         <div className={classes.inputWrapper}>
//                             {/* <input
//                                 type="text"
//                                 className={classes.usernameInput}
//                                 value={newUsername}
//                                 onChange={(e) => setNewUsername(e.target.value)}
//                                 placeholder="Enter new username"
//                             /> */}
//                             <select name="gender" id="gender" className={classes.dropdown} value={gender} onChange={(e)=>{setgender(e.target.value)}}>
//                                 <option value="male">Male</option>
//                                 <option value="female">Female</option>
//                                 <option value="others">Others</option>

//                             </select>
//                         </div>

//                         {updateMsg && (
//                             <p className={classes.updateMsg}>{updateMsg}</p>
//                         )}

//                         <button
//                             className={classes.updateBtn}
//                             onClick={handleUpdate}
//                             disabled={isUpdating}
//                         >
//                             {isUpdating ? 'UPDATING...' : 'UPDATE'}
//                         </button>
//                     </div>
//                 </div>

//                 {/* 📊 Stats */}
//                 <div className={classes.mainStatsArea}>
//                     <div className={classes.bigStatBox}>
//                         <span className={classes.bigVal}>{userStats?.wins || 0}</span>
//                         <span className={classes.bigLabel}>{t('Total Wins')}</span>
//                     </div>
//                     <div className={classes.statsLine}>
//                         <div className={classes.smallStat}>
//                             <span className={classes.sVal}>{userStats?.total_games || 0}</span>
//                             <span className={classes.sLabel}>{t('Games')}</span>
//                         </div>
//                         <div className={classes.devider}></div>
//                         <div className={classes.smallStat}>
//                             <span className={classes.sVal}>{winRate}%</span>
//                             <span className={classes.sLabel}>{t('Win Rate')}</span>
//                         </div>
//                         <div className={classes.devider}></div>
//                         <div className={classes.smallStat}>
//                             <span className={classes.sVal}>{userStats?.losses || 0}</span>
//                             <span className={classes.sLabel}>{t('Loss')}</span>
//                         </div>
//                     </div>
//                 </div>

//                 {/* 🔘 Actions */}
//                 <div className={classes.bottomActions}>
//                     <button className={classes.redeemBtn} onClick={() => navigate("/redeem")}>{t('REDEEM COINS')}</button>
//                     <button className={classes.signoutBtn} onClick={handleLogout}>{t('SIGN OUT')}</button>
//                     <button className={classes.menuBtn} onClick={() => navigate("/menu")}>{t('BACK TO MENU')}</button>
//                 </div>

//             </div>
//         </div>


//        <div id="cameraModal" className={classes.cameraModal}>
//     <div id="camera" className={classes.camera}>
//         <video
//             ref={videoRef}
//             autoPlay
//             playsInline
//             muted
//             className={classes.cameraFeed}
//         />
//         <button className={classes.captureBtn} >
//             📷
//         </button>
//     </div>
// </div>
//         </>
//     );
// };

// export default Profile;









import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "react-avatar";
import classes from "./Profile.module.css";
import { fetchProfileFun, deductCoinsFun } from "../Services/ApiFun";
import useTranslate from "../Util/ChangeLang";
import axios from "axios";
import { baseUrl1 } from '../Services/api';
import Emoji from "../Components/Emoji";

const Profile = () => {
    const navigate = useNavigate();
    const t = useTranslate();
    const [userStats, setUserStats] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isRedeeming, setIsRedeeming] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState(null);
    const [newUsername, setNewUsername] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateMsg, setUpdateMsg] = useState('');

    // Initialize gender from localStorage
    const [gender, setgender] = useState(() => {
        const loggedUser = JSON.parse(localStorage.getItem("ludo_user") || "null");
        return loggedUser?.gender || 'male';
    });

    const [showUploadPopup, setShowUploadPopup] = useState(false);
    const [showCameraModal, setShowCameraModal] = useState(false);

    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const fileInputRef = useRef(null);

    const avtarImages = [
        { image: '/avatar1.png', alt: "Avatar 1" },
        { image: '/avatar2.png', alt: "Avatar 2" },
        { image: '/avatar3.png', alt: "Avatar 3" },
        { image: '/avatar4.png', alt: "Avatar 4" },
        { image: '/avatar5.png', alt: "Avatar 5" },
        { image: '/avatar6.jpeg', alt: "Avatar 6" },
    ];

    useEffect(() => {
        if (!showCameraModal) return;

        const startCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                streamRef.current = stream;
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Camera access denied:", err);
            }
        };

        startCamera();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
        };
    }, [showCameraModal]);

    const loadProfile = async () => {
        const loggedUser = JSON.parse(localStorage.getItem("ludo_user") || "null");
        if (!loggedUser || !loggedUser.id) {
            navigate("/auth");
            return;
        }
        try {
            const res = await fetchProfileFun(loggedUser.id);
            setUserStats(res.user);
            setNewUsername(res.user?.username || '');
            const updatedUser = { ...loggedUser, ...res.user };
            localStorage.setItem("ludo_user", JSON.stringify(updatedUser));
            // sync gender state with latest from server
            if (res.user?.gender) setgender(res.user.gender);
            const existingIndex = avtarImages.findIndex(a => a.image === res.user?.avatar);
            if (existingIndex !== -1) setSelectedAvatar(existingIndex);
        } catch (err) {
            setError(t("Something went wrong. Please try again."));
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, [navigate, t]);

    const handleLogout = () => {
        localStorage.removeItem("ludo_auth_token");
        localStorage.removeItem("ludo_user");
        localStorage.removeItem("ludo_player_name");
        navigate("/");
    };

    const handleRedeem = async (coinsToDeduct, usdAmount) => {
        if (!userStats || userStats.coins < coinsToDeduct) {
            alert(t('Insufficient Coins! Keep playing to earn more.'));
            return;
        }
        setIsRedeeming(true);
        try {
            await deductCoinsFun(userStats.id, coinsToDeduct);
            setUserStats(prev => ({ ...prev, coins: prev.coins - coinsToDeduct }));
            alert(`${t('Successfully redeemed')} ${usdAmount} USD! ${t('Details have been sent to your email.')}`);
        } catch (err) {
            alert(t('Redemption failed. Please try again.'));
            console.error(err);
        } finally {
            setIsRedeeming(false);
        }
    };

    const handleGalleryUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setShowUploadPopup(false);

        const uploadAvatar = async () => {
            if (!userStats?.id) return;
            setIsUpdating(true);
            setUpdateMsg('');
            try {
                const formData = new FormData();
                formData.append('id', userStats.id);
                formData.append('avatar', file);

                await axios.post(
                    `${baseUrl1}/users/edit-profile`,
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );

                setUpdateMsg('Profile photo updated successfully!');
                loadProfile();
            } catch (err) {
                console.error(err);
                setUpdateMsg('Update failed. Please try again.');
            } finally {
                setIsUpdating(false);
            }
        };

        uploadAvatar();
    };

    const handleCapture = async () => {
        if (!videoRef.current) return;

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0);

        canvas.toBlob(async (blob) => {
            if (!blob || !userStats?.id) return;

            const file = new File([blob], 'captured_avatar.png', { type: 'image/png' });

            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
            }
            setShowCameraModal(false);
            setIsUpdating(true);
            setUpdateMsg('');

            try {
                const formData = new FormData();
                formData.append('id', userStats.id);
                formData.append('avatar', file);

                await axios.post(
                    `${baseUrl1}/users/edit-profile`,
                    formData,
                    { headers: { 'Content-Type': 'multipart/form-data' } }
                );

                setUpdateMsg('Profile photo updated successfully!');
                loadProfile();
            } catch (err) {
                console.error(err);
                setUpdateMsg('Update failed. Please try again.');
            } finally {
                setIsUpdating(false);
            }
        }, 'image/png');
    };

    const handleCloseCameraModal = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setShowCameraModal(false);
    };

    let handleUpdate = async () => {
        if (!userStats?.id) return;

        const loggedUser = JSON.parse(localStorage.getItem("ludo_user") || "null");
        const storedGender = loggedUser?.gender || 'male';

        const usernameChanged = newUsername.trim() && newUsername.trim() !== userStats.username;
        const avatarChanged = selectedAvatar !== null;
        const genderChanged = gender !== storedGender;

        // nothing changed at all
        if (!usernameChanged && !avatarChanged && !genderChanged) {
            setUpdateMsg('Nothing to update!');
            return;
        }

        setIsUpdating(true);
        setUpdateMsg('');

        try {
            const formData = new FormData();
            formData.append('id', userStats.id);

            if (usernameChanged) {
                formData.append('username', newUsername.trim());
            }

            if (avatarChanged) {
                const avatarPath = avtarImages[selectedAvatar].image;
                const response = await fetch(avatarPath);
                const blob = await response.blob();
                const file = new File([blob], `avatar${selectedAvatar + 1}.png`, { type: 'image/png' });
                formData.append('avatar', file);
            }

            // only send gender if it actually changed
            if (genderChanged) {
                formData.append('gender', gender);
            }

            await axios.post(
                `${baseUrl1}/users/edit-profile`,
                formData,
                { headers: { 'Content-Type': 'multipart/form-data' } }
            );

            setUserStats(prev => ({
                ...prev,
                username: newUsername.trim() || prev.username,
                avatar: avatarChanged ? avtarImages[selectedAvatar].image : prev.avatar,
                gender: genderChanged ? gender : prev.gender,
            }));

            // update localStorage
            if (loggedUser) {
                if (usernameChanged) loggedUser.username = newUsername.trim();
                if (genderChanged) loggedUser.gender = gender;
                localStorage.setItem("ludo_user", JSON.stringify(loggedUser));
            }

            setUpdateMsg('Profile updated successfully!');
            loadProfile();
        } catch (err) {
            console.error(err);
            setUpdateMsg('Update failed. Please try again.');
        } finally {
            setIsUpdating(false);
        }
    };

    if (isLoading) {
        return (
            <div className={classes.container}>
                <div className={classes.loading}>{t('Loading Master Profile...')}</div>
            </div>
        );
    }

    const winRate = userStats
        ? ((userStats.wins / (userStats.total_games || 1)) * 100).toFixed(1)
        : 0;

    return (
        <>
            <div className={classes.container}>
                <button className={classes.backButton} onClick={() => navigate("/menu")}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="22">
                        <path d="M19 12H5M5 12L12 19M5 12L12 5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span>{t('Back')}</span>
                </button>

                <div className={classes.brandingHeader}>
                    <h1 className={classes.titleMain}>{t('ETHIO LUDO')}</h1>
                </div>

                <div className={classes.profileWrapper}>

                    <div className={classes.heroPart}>
                        <div
                            className={classes.avatarGlow}
                            onClick={() => setShowUploadPopup(true)}
                            style={{ cursor: 'pointer' }}
                        >
                            <div className={classes.avatarFrame}>
                                <div id="overlayImage" className={classes.overlayimage}>
                                    <Avatar
                                        name={userStats?.username || t("Ludo Champ")}
                                        round={true}
                                        size="100%"
                                        src={userStats?.avatar ? `${baseUrl1}${userStats.avatar}` : null}
                                        color={Avatar.getRandomColor('sitebase', ['#f44336', '#4caf50', '#2196f3', '#fad416'])}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className={classes.identityInfo}>
                            <h2 className={classes.username}>{userStats?.username || t("Ludo Champ")}</h2>
                            <span className={classes.uidText}>{t('UID')}: #{String(userStats?.id || 0).padStart(5, '0')}</span>
                        </div>
                    </div>

                    <div className={classes.walletItems}>
                        <div className={classes.walletItem}>
                            <span className={classes.walletIcon}><Emoji id="coin" size="20px" /></span>
                            <span className={classes.walletValue}>{userStats?.coins?.toLocaleString() || 0}</span>
                        </div>
                        <div className={classes.walletItem}>
                            <span className={classes.walletIcon}>💎</span>
                            <span className={classes.walletValue}>0</span>
                        </div>
                    </div>

                    <div className={classes.editProfile}>
                        <h1 className={classes.editTitle}>{t('Edit Profile')}</h1>

                        <h2 className={classes.updateTitle}>{t('Select Avatar')}</h2>
                        <div className={classes.AvtarSec}>
                            {avtarImages.map((e, index) => (
                                <div
                                    key={index}
                                    className={`${classes.avtar} ${selectedAvatar === index ? classes.selected : ''}`}
                                    onClick={() => setSelectedAvatar(index)}
                                >
                                    <img src={e.image} alt={e.alt} />
                                </div>
                            ))}
                        </div>

                        <div className={classes.updateSection}>
                            <h2 className={classes.updateTitle}>{t('Edit Username')}</h2>
                            <div className={classes.inputWrapper}>
                                <input
                                    type="text"
                                    className={classes.usernameInput}
                                    value={newUsername}
                                    onChange={(e) => setNewUsername(e.target.value)}
                                    placeholder={t("enter new username")}
                                />
                            </div>

                            <h2 className={classes.updateTitle}>{t('Gender')}</h2>
                            <div className={classes.inputWrapper}>
                                <select
                                    name="gender"
                                    id="gender"
                                    className={classes.dropdown}
                                    value={gender}
                                    onChange={(e) => setgender(e.target.value)}
                                >
                                    <option value="male">{t('Male')}</option>
                                    <option value="female">{t('Female')}</option>
                                    {/* <option value="others">Others</option> */}
                                </select>
                            </div>

                            {updateMsg && <p className={classes.updateMsg}>{updateMsg}</p>}

                            <button
                                className={classes.updateBtn}
                                onClick={handleUpdate}
                                disabled={isUpdating}
                            >
                                {isUpdating ? `${t('UPDATING')}` : `${t('UPDATE')}`}
                            </button>
                        </div>
                    </div>

                    <div className={classes.mainStatsArea}>
                        <div className={classes.bigStatBox}>
                            <span className={classes.bigVal}>{userStats?.wins || 0}</span>
                            <span className={classes.bigLabel}>{t('Total Wins')}</span>
                        </div>
                        <div className={classes.statsLine}>
                            <div className={classes.smallStat}>
                                <span className={classes.sVal}>{userStats?.total_games || 0}</span>
                                <span className={classes.sLabel}>{t('Games')}</span>
                            </div>
                            <div className={classes.devider}></div>
                            <div className={classes.smallStat}>
                                <span className={classes.sVal}>{winRate}%</span>
                                <span className={classes.sLabel}>{t('Win Rate')}</span>
                            </div>
                            <div className={classes.devider}></div>
                            <div className={classes.smallStat}>
                                <span className={classes.sVal}>{userStats?.losses || 0}</span>
                                <span className={classes.sLabel}>{t('Loss')}</span>
                            </div>
                        </div>
                    </div>

                    <div className={classes.bottomActions}>
                        <button className={classes.redeemBtn} onClick={() => navigate("/redeem")}>{t('REDEEM COINS')}</button>
                        <button className={classes.signoutBtn} onClick={handleLogout}>{t('SIGN OUT')}</button>
                        <button className={classes.menuBtn} onClick={() => navigate("/menu")}>{t('BACK TO MENU')}</button>
                    </div>
                </div>
            </div>

            <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleGalleryUpload}
            />

            {showUploadPopup && (
                <div className={classes.popupOverlay} onClick={() => setShowUploadPopup(false)}>
                    <div className={classes.popupBox} onClick={(e) => e.stopPropagation()}>
                        <h3 className={classes.popupTitle}>{t('Update Profile Photo')}</h3>
                        <button
                            className={classes.popupBtn}
                            onClick={() => {
                                setShowUploadPopup(false);
                                fileInputRef.current.click();
                            }}
                        >
                          {t("Upload From Gallery")}
                        </button>
                        <button
                            className={classes.popupBtn}
                            onClick={() => {
                                setShowUploadPopup(false);
                                setShowCameraModal(true);
                            }}
                        >
                            {t('Capture Photo')}
                        </button>
                        <button
                            className={classes.popupCancelBtn}
                            onClick={() => setShowUploadPopup(false)}
                        >
                            {t('Cancel')}
                        </button>
                    </div>
                </div>
            )}

            {showCameraModal && (
                <div className={classes.cameraModal}>
                    <div className={classes.camera}>
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className={classes.cameraFeed}
                        />
                        <div className={classes.cameraActions}>
                            <button className={classes.captureBtn} onClick={handleCapture}>
                               {t('Capture')} 
                            </button>
                            <button className={classes.closeCameraBtn} onClick={handleCloseCameraModal}>
                                {t('Cancel')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Profile;