import { useEffect } from "react";
import { useLocation } from "react-router-dom";

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
import CompanyInvite from "./pages/CompanyInvite";
import Projects from "./pages/Projects";
import ProjectDetailPage from "./pages/ProjectDetailPage";
import EditProjectPage from "./pages/EditProjectPage";
import Tasks from "./pages/Tasks";
import TasksDetailPage from "./pages/TasksDetailPage";
import TeamMembers from "./pages/TeamMembers";
import Notifications from "./pages/Notifications";
import Archive from "./pages/Archive";
import Settings from "./pages/Settings";
import Invites from "./pages/Invites";

//Layouts
import AuthLayout from "./layout/authLayout";
import DashboardLayout from "./layout/DashboardLayout";

import ProtectedRoute from "./components/ProtectedRoute";
import { useAuthStore } from "./store/useAuthStore";
import { useSocketStore } from "./store/useSocketStore";

import { Loader } from "./components/Loader";
import { Toaster } from "sonner";
import log from "./utils/logger";

export default function App() {
  const location = useLocation();
  const publicRoutes = ["/company-invite"];

  const isPublicRoute = publicRoutes.some((route) =>
    location.pathname.startsWith(route),
  );

  const { checkAuth, authUser, accessToken, isCheckingAuth, hasCheckedAuth } =
    useAuthStore();

  //  you're using JWTs with refresh tokens, and the access token is stored in memory (via Zustand). When the user refreshes the page or reopens the browser:
  useEffect(() => {
    // Check if user is already logged in and update the state
    log("checkAuth() ran");
    log("authUser:", authUser);

    if (!isPublicRoute) {
      checkAuth(); //  Run only for protected routes
    } else {
      log("Skipping auth for:", location.pathname);
    }
  }, [checkAuth, location]);

  useEffect(() => {
    const accessToken = useAuthStore.getState().accessToken;
    log("The updated accessToken is:", accessToken);

    if (!isPublicRoute && accessToken) {
      useSocketStore.getState().connect();
    } else {
      log(
        "Skipping socket connect on public route:",
        location.pathname,
      );
    }
  }, [accessToken, location]); // Re-run this effect when the token changes

  // Skip the loader for public routes
  if (!isPublicRoute && (isCheckingAuth || !hasCheckedAuth)) {
    return <Loader />;
  }

  return (
    <>
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
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/projects/edit/:id" element={<EditProjectPage />} />
              <Route path="/tasks/:taskId" element={<TasksDetailPage />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/team" element={<TeamMembers />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/archives" element={<Archive />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/invites" element={<Invites />} />
            </Route>
          </Route>
        </Route>

        {/* Catch-All Route (404 Page) */}
        <Route path="/company-invite/:token" element={<CompanyInvite />} />
        <Route path="*" element={<h1>404 - Not Found</h1>} />
      </Routes>

      <Toaster position="bottom-right" />
    </>
  );
}
