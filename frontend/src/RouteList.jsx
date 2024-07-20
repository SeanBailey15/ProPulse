import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./components/Home";
import RegisterForm from "./components/RegisterForm";
import SignUpForm from "./components/SignUpForm";
import LoginForm from "./components/LoginForm";
import ProfileForm from "./components/ProfileForm";
import ErrorPage from "./components/ErrorPage";

export default function RouteList({ signUp, login }) {
  return (
    <Routes>
      <Route exact path="/" element={<Home />} />
      <Route exact path="/signup" element={<SignUpForm signUp={signUp} />} />
      <Route exact path="/login" element={<LoginForm login={login} />} />
      <Route element={<ProtectedRoute />}>
        <Route exact path="/users/:id" element={<ProfileForm />} />
      </Route>
      <Route path="/error" element={<ErrorPage />} />
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}
