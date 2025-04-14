import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore"; // adjust path if needed
import {Loader} from "../components/Loader";

// const ProtectedRoute = () => {
//   const { authUser } = useAuthStore();
//   return authUser ? <Outlet /> : <Navigate to="/signin" />;
// };

const ProtectedRoute = () => {
  const { authUser, isCheckingAuth, hasCheckedAuth } = useAuthStore();

  if (isCheckingAuth || !hasCheckedAuth) {
    return (
      <Loader />
    );
  }

  return authUser ? <Outlet /> : <Navigate to="/signin" replace />;
};

export default ProtectedRoute;
