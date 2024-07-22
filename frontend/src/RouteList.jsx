import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./components/Home";
import SignUpForm from "./components/SignUpForm";
import LoginForm from "./components/LoginForm";
import ProfileForm from "./components/ProfileForm";
import UserInfo from "./components/UserInfo";
import Dashboard from "./components/Dashboard";
import JobForm from "./components/JobForm";
import Job from "./components/Job";
import PostForm from "./components/PostForm";
import PostDetails from "./components/PostDetails";
import ReplyForm from "./components/ReplyForm";
import ReplyDetails from "./components/ReplyDetails";
import InviteForm from "./components/InviteForm";
import ErrorPage from "./components/ErrorPage";

export default function RouteList({ signUp, login, urlBase64ToUint8Array }) {
  return (
    <Routes>
      <Route exact path="/" element={<Home />} />
      <Route
        exact
        path="/signup"
        element={
          <SignUpForm
            signUp={signUp}
            urlBase64ToUint8Array={urlBase64ToUint8Array}
          />
        }
      />
      <Route exact path="/login" element={<LoginForm login={login} />} />
      <Route element={<ProtectedRoute />}>
        <Route exact path="/users/:id" element={<ProfileForm />} />
        <Route exact path="/users/info/:id" element={<UserInfo />} />
        <Route exact path="/users/dashboard/:id" element={<Dashboard />} />
        <Route exact path="/newProject" element={<JobForm />} />
        <Route exact path="/projects/:id" element={<Job />} />
        <Route exact path="/projects/:id/createPost" element={<PostForm />} />
        <Route exact path="/posts/:id" element={<PostDetails />} />
        <Route exact path="/posts/:id/createReply" element={<ReplyForm />} />
        <Route exact path="/replies/:id" element={<ReplyDetails />} />
        <Route exact path="/invite/:id" element={<InviteForm />} />
      </Route>
      <Route path="/error" element={<ErrorPage />} />
      <Route path="*" element={<ErrorPage />} />
    </Routes>
  );
}
