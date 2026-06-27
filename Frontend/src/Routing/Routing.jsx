// import React from "react";
// import { createBrowserRouter, RouterProvider } from "react-router-dom";
// import SplashScreen from "../Pages/SplashScreen";
// import MainMenu from "../Pages/MainMenu";
// import PlayerCount from "../Pages/PlayerCount";
// import Home from "../Pages/Home";
// import GameRoom from "../Pages/GameRoom";
// import Results from "../Pages/Results";
// import OnlineMode from "../Pages/OnlineMode";
// import CreateOnlineGame from "../Pages/CreateOnlineGame";
// import JoinOnlineGame from "../Pages/JoinOnlineGame";
// import GameLobby from "../Pages/GameLobby";
// import VSComputerMode from "../Pages/VSComputerMode";
// import Auth from "../Pages/Auth";
// import Profile from "../Pages/Profile";
// import Leaderboard from "../Pages/Leaderboard";
// import WorldwideMatchmaking from "../Pages/WorldwideMatchmaking";
// import ErrorPage from "../Pages/ErrorPage";
// import RedeemVault from "../Pages/RedeemVault";
// import SpinWheel from "../Pages/SpinWheel";
// import Lucky7 from "../Pages/Lucky7";
// import DiceRollingPage from "../Pages/DiceRollingPage";
// import DailyTasks from "../Pages/DailyTasks";
// import TermsAndConditions from "../Pages/TermsAndConditions";
// import CoinShop from "../Pages/CoinShop";

// import { SoundProvider } from "../context/SoundContext";
// import SoundToggle from "../Components/SoundToggle";
// import LanguageSelector from "../Components/LanguageSelector";
// import { Outlet } from "react-router-dom";

// const RootLayout = () => (
//   <SoundProvider>
//     <Outlet />
//   </SoundProvider>
// );

// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <RootLayout />,
//     errorElement: <ErrorPage />,
//     children: [
//       {
//         path: "/",
//         element: <SplashScreen />,
//       },
//       {
//         path: "/menu",
//         element: <MainMenu />,
//       },
//       {
//         path: "/shop",
//         element: <CoinShop />,
//       },
//       {
//         path: "/auth",
//         element: <Auth />,
//       },
//        {
//         path: "/profile",
//         element: <Profile />,
//       },

//       {
//         path: "/player-count",
//         element: <PlayerCount />,
//       },
//       {
//         path: "/vs-computer",
//         element: <VSComputerMode />,
//       },
//       {
//         path: "/setup-players",
//         element: <Home />,
//       },
//       {
//         path: "/online-mode",
//         element: <OnlineMode />,
//       },
//       {
//         path: "/online/create",
//         element: <CreateOnlineGame />,
//       },
//       {
//         path: "/online/join",
//         element: <JoinOnlineGame />,
//       },
//       {
//         path: "/online/matchmaking",
//         element: <WorldwideMatchmaking />,
//       },
//       {
//         path: "/lobby/:gameId",
//         element: <GameLobby />,
//       },
//       {
//         path: "/game/:gameId",
//         element: <GameRoom />,
//       },
//       {
//         path: "/results",
//         element: <Results />,
//       },
    
//       {
//         path: "/leaderboard",
//         element: <Leaderboard />,
//       },
//       {
//         path: "/redeem",
//         element: <RedeemVault />,
//       },
//       {
//         path: "/spin-wheel",
//         element: <SpinWheel />,
//       },

//       {
//         path: "/lucky-7",
//         element: <Lucky7 />,
//       },
//       {
//         path: "/lucky-7/rolling",
//         element: <DiceRollingPage />,
//       },
//       {
//         path: "/daily-tasks",
//         element: <DailyTasks />,
//       },
//       {
//         path: "/terms",
//         element: <TermsAndConditions />,
//       },

//       {
//         path: "*",
//         element: <ErrorPage />,
//       },
//     ],
//   },
// ]);

// const Routing = () => {
//   return <RouterProvider router={router} />;
// };

// export default Routing;





import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SplashScreen from "../Pages/SplashScreen";
import MainMenu from "../Pages/MainMenu";
import PlayerCount from "../Pages/PlayerCount";
import Home from "../Pages/Home";
import GameRoom from "../Pages/GameRoom";
import Results from "../Pages/Results";
import OnlineMode from "../Pages/OnlineMode";
import CreateOnlineGame from "../Pages/CreateOnlineGame";
import JoinOnlineGame from "../Pages/JoinOnlineGame";
import GameLobby from "../Pages/GameLobby";
import VSComputerMode from "../Pages/VSComputerMode";
// import Auth from "../Pages/Auth";
import Login from "../Pages/Login";
import Signup from "../Pages/Signup";
import Profile from "../Pages/Profile";
import Leaderboard from "../Pages/Leaderboard";
import WorldwideMatchmaking from "../Pages/WorldwideMatchmaking";
import ErrorPage from "../Pages/ErrorPage";
import RedeemVault from "../Pages/RedeemVault";
import SpinWheel from "../Pages/SpinWheel";
import Lucky7 from "../Pages/Lucky7";
import DiceRollingPage from "../Pages/DiceRollingPage";
import DailyTasks from "../Pages/DailyTasks";
import TermsAndConditions from "../Pages/TermsAndConditions";
import CoinShop from "../Pages/CoinShop";

import { SoundProvider } from "../context/SoundContext";
import SoundToggle from "../Components/SoundToggle";
import LanguageSelector from "../Components/LanguageSelector";
import { Outlet } from "react-router-dom";

const RootLayout = () => (
  <SoundProvider>
    <Outlet />
  </SoundProvider>
);

const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <SplashScreen />,
      },
      {
        path: "/menu",
        element: <MainMenu />,
      },
      {
        path: "/shop",
        element: <CoinShop />,
      },
      // {
      //   path: "/auth",
      //   element: <Auth />,
      // },
      {
        path: "/auth",
        element: <Login />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
       {
        path: "/profile",
        element: <Profile />,
      },
      

      {
        path: "/player-count",
        element: <PlayerCount />,
      },
      {
        path: "/vs-computer",
        element: <VSComputerMode />,
      },
      {
        path: "/setup-players",
        element: <Home />,
      },
      {
        path: "/online-mode",
        element: <OnlineMode />,
      },
      {
        path: "/online/create",
        element: <CreateOnlineGame />,
      },
      {
        path: "/online/join",
        element: <JoinOnlineGame />,
      },
      {
        path: "/online/matchmaking",
        element: <WorldwideMatchmaking />,
      },
      {
        path: "/lobby/:gameId",
        element: <GameLobby />,
      },
      {
        path: "/game/:gameId",
        element: <GameRoom />,
      },
      {
        path: "/results",
        element: <Results />,
      },
    
      {
        path: "/leaderboard",
        element: <Leaderboard />,
      },
      {
        path: "/redeem",
        element: <RedeemVault />,
      },
      {
        path: "/spin-wheel",
        element: <SpinWheel />,
      },

      {
        path: "/lucky-7",
        element: <Lucky7 />,
      },
      {
        path: "/lucky-7/rolling",
        element: <DiceRollingPage />,
      },
      {
        path: "/daily-tasks",
        element: <DailyTasks />,
      },
      {
        path: "/terms",
        element: <TermsAndConditions />,
      },

      {
        path: "*",
        element: <ErrorPage />,
      },
    ],
  },
]);

const Routing = () => {
  return <RouterProvider router={router} />;
};

export default Routing;