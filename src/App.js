// import Home from './pages/home/Home';
// import Login from './pages/login/login';
// import Register from './pages/register/register';
// import Profile from './pages/profile/profile';
// import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
// import { useContext } from 'react';
// import { AuthContext } from './state/AuthContext';


// function App() {
//   const { user } = useContext(AuthContext);

//   return (
//     <Router>
//       <Routes>
//         <Route path="/" element={user ? <Home /> : <Navigate to = "/login" />} />
//         <Route path="/login" element={user ? <Navigate to={"/"} /> : <Login />} />
//         <Route path="/register" element={user ? <Navigate to={"/"} /> : <Register />} />
//         <Route path="/profile/:username" element={user ? <Profile /> : <Navigate to={"/login"} />} />
//       </Routes>
//     </Router>
//   );
// }

import React, { useEffect, lazy, Suspense, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from './state/AuthContext';

const Home = lazy(() => import('./pages/home/Home'));
const Login = lazy(() => import('./pages/login/login'));
const Register = lazy(() => import('./pages/register/register'));
const Profile = lazy(() => import('./pages/profile/profile'));
const SearchResults = lazy(() => import('./pages/search_result/search_result'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));
const Setting = lazy(() => import('./pages/setting/setting'));
const Messenger = lazy(() => import('./pages/messenger/Messenger'));
const Notification = lazy(() => import('./pages/notification/notification'));
const PrivacyPolicy = lazy(() => import('./pages/privacyPolicy/PrivacyPolicy'));
const Ranking = lazy(() => import('./pages/ranking/ranking'));
const Learning = lazy(() => import('./pages/learning/learning'));

axios.defaults.baseURL = process.env.REACT_APP_API_URL || "";
axios.defaults.withCredentials = true;


const themeColors = {
  light: "#ffffff",
  dark: "#15202b",
};

function App() {
  const { user, dispatch } = useContext(AuthContext);

  const needsPrivacyAgreement = user && !user.hasAgreedToPrivacyPolicy;

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        try {
          const response = await axios.get("/api/users/me");
          dispatch({ type: "LOGIN_SUCCESS", payload: response.data });
        } catch (err) {
          console.error(
            "トークンによるユーザー情報の取得に失敗しました:",
            err
          );
          dispatch({ type: "LOGIN_FAILURE", payload: err });
          localStorage.removeItem("token");
        }
      }
    };
    fetchUser();
  }, [dispatch]);

  // Effect to apply theme settings globally
  useEffect(() => {
    if (user) {
      const theme =
        (user.backgroundColor || "").toLowerCase() === themeColors.dark.toLowerCase() ? "dark" : "light";
      document.body.style.backgroundColor = user.backgroundColor || themeColors.light;
      document.body.style.fontFamily = user.font || "Arial";

      if (theme === "dark") {
        document.body.classList.add("dark-theme");
      } else {
        document.body.classList.remove("dark-theme");
      }
    }
  }, [user]); // Rerun when user object changes

  return (
    <Router>
      <Suspense fallback={<div style={{ padding: 24 }}>Loading...</div>}>
        <Routes>
          {/* 保護されたルート */}
          <Route
            path="/"
            element={
              user ? (
                needsPrivacyAgreement ? (
                  <Navigate to="/privacy-policy" />
                ) : (
                  <Home />
                )
              ) : (
                <Navigate to="/login" />
              )
            }
          />
        <Route
          path="/profile/:username"
          element={
            user ? (
              needsPrivacyAgreement ? (
                <Navigate to="/privacy-policy" />
              ) : (
                <Profile />
              )
            ) : (
              <Navigate to={"/login"} />
            )
          }
        />
        <Route
          path="/search"
          element={
            user ? (
              needsPrivacyAgreement ? (
                <Navigate to="/privacy-policy" />
              ) : (
                <SearchResults />
              )
            ) : (
              <Navigate to={"/login"} />
            )
          }
        />
        <Route
          path="/setting"
          element={
            user ? (
              needsPrivacyAgreement ? (
                <Navigate to="/privacy-policy" />
              ) : (
                <Setting />
              )
            ) : (
              <Navigate to={"/login"} />
            )
          }
        />
        <Route
          path="/messenger"
          element={
            user ? (
              needsPrivacyAgreement ? (
                <Navigate to="/privacy-policy" />
              ) : (
                <Messenger />
              )
            ) : (
              <Navigate to={"/login"} />
            )
          }
        />
        <Route
          path="/notifications"
          element={
            user ? (
              needsPrivacyAgreement ? (
                <Navigate to="/privacy-policy" />
              ) : (
                <Notification />
              )
            ) : (
              <Navigate to={"/login"} />
            )
          }
        />
        <Route
          path="/privacy-policy"
          element={user ? <PrivacyPolicy /> : <Navigate to="/login" />}
        />
        <Route
          path="/ranking"
          element={
            user ? (
              needsPrivacyAgreement ? (
                <Navigate to="/privacy-policy" />
              ) : (
                <Ranking />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/learning"
          element={
            user ? (
              needsPrivacyAgreement ? (
                <Navigate to="/privacy-policy" />
              ) : (
                <Learning />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* 公開ルート */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" /> : <Register />}
        />
        <Route path="/auth/success" element={<AuthCallback />} />
        </Routes>
      </Suspense>
    </Router>
  );
}



export default App;
