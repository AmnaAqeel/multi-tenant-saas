import { useEffect } from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

//Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

//Dashboard pages
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import CompanyInvite from "./pages/CompanyInvite";
import Tasks from "./pages/Tasks";
import TeamMembers from "./pages/TeamMembers";
import Notifications from "./pages/Notifications";
import Archive from "./pages/Archive";
import Settings from "./pages/Settings";

//Layouts
import AuthLayout from "./layout/AuthLayout";
import DashboardLayout from "./layout/DashboardLayout";

import ProtectedRoute from "./components/ProtectedRoute";
import { useAuthStore } from "./store/useAuthStore";
import { useSocketStore } from "./store/useSocketStore";

import { Loader } from "./components/Loader";
import { Toaster } from "sonner";

export default function App() {
  const { checkAuth, authUser, accessToken, isCheckingAuth, hasCheckedAuth } =
    useAuthStore();
  const { connect } = useSocketStore();

  //  you're using JWTs with refresh tokens, and the access token is stored in memory (via Zustand). When the user refreshes the page or reopens the browser:
  useEffect(() => {
    // Check if user is already logged in and update the state
    console.log("checkAuth() ran");
    checkAuth();
  }, [checkAuth]);
  
  useEffect(() => {
    const accessToken = useAuthStore.getState().accessToken;
    console.log("The updated accessToken is:", accessToken);

    if (accessToken) {
      useSocketStore.getState().connect();
    }
  }, [useAuthStore.getState().accessToken]); // Re-run this effect when the token changes

  if (isCheckingAuth || !hasCheckedAuth) return <Loader />;

  return (
    <Router>
      <Routes>
        {/* Auth Pages Wrapped Inside AuthLayout */}
        <Route element={<AuthLayout />}>
          <Route
            path="/signin"
            element={
              !authUser && !accessToken ? <Login /> : <Navigate to="/" />
            }
          />
          <Route
            path="/signup"
            element={!authUser ? <Register /> : <Navigate to="/signin" />}
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Dashboard Route */}
        <Route>
          <Route element={<ProtectedRoute />}>
            {/* All routes that need sidebar go here */}
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/team" element={<TeamMembers />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/archive" element={<Archive />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
          </Route>
        </Route>

        {/* Catch-All Route (404 Page) */}
        <Route path="/company-invite/:token" element={<CompanyInvite />} />
        <Route path="*" element={<h1>404 - Not Found</h1>} />
      </Routes>

      <Toaster position="bottom-right" />
    </Router>
  );
}
