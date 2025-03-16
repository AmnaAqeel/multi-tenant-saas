import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AuthLayout from "./layout/AuthLayout";

import {Toaster} from "sonner"

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect "/" to "/login" */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth Pages Wrapped Inside AuthLayout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        {/* Dashboard Route */}
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}

        {/* Catch-All Route (404 Page) */}
        <Route path="*" element={<h1>404 - Not Found</h1>} />
      </Routes>

      <Toaster />
    </Router>
  );
}
