import { useContext } from "react";
import UserContext from "../contexts/UserContext";
import { Outlet, Navigate } from "react-router-dom";

export default function ProtectedRoute() {
  const { currentUser } = useContext(UserContext);

  if (!currentUser) {
    return <Navigate to="/login" replace={true} />;
  }

  return <Outlet />;
}
