import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import Navbar from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MainPage from "./pages/MainPage";
import MapPage from "./pages/MapPage";
import NotificationsPage from "./pages/NotificationsPage";
import ProfilePage from "./pages/ProfilePage";
import EventsPage from "./pages/EventsPage";
import ProtectedRoutes from "./components/ProtectedRoutes";
import RestrictedRoutes from "./components/RestrictedRoutes";
import CreateEventPage from "./pages/CreateEventPage";
import EditProfilePage from "./pages/EditProfilePage";

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<RestrictedRoutes />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          <Route element={<ProtectedRoutes />}>
            <Route
              path="/"
              element={
                <>
                  <Navbar />
                  <MainPage />
                </>
              }
            />
            <Route
              path="/map"
              element={
                <>
                  <Navbar />
                  <MapPage />
                </>
              }
            />
            <Route
              path="/notifications"
              element={
                <>
                  <Navbar />
                  <NotificationsPage />
                </>
              }
            />
            <Route
              path="/profile"
              element={
                <>
                  <Navbar />
                  <ProfilePage />
                </>
              }
            />
            <Route
              path="/events"
              element={
                <>
                  <Navbar />
                  <EventsPage />
                </>
              }
            />
            <Route
              path="/create-event"
              element={
                <>
                  <Navbar />
                  <CreateEventPage />
                </>
              }
            />
            <Route
              path="/edit-profile"
              element={
                <>
                  <EditProfilePage />
                </>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
