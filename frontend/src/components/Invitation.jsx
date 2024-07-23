import { Form, Button } from "reactstrap";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useContext } from "react";
import { jwtDecode } from "jwt-decode";
import ProPulseApi from "../api";
import UserContext from "../contexts/UserContext";
import "../styles/Invitation.css";

export default function Invitation() {
  const navigate = useNavigate();
  const [query] = useSearchParams();
  const { setToken } = useContext(UserContext);
  const token = query.get("token");
  const { jobId } = jwtDecode(token);

  const handleSubmit = async () => {
    try {
      const res = await ProPulseApi.acceptInvite(query);
      console.log(res);
      setToken(res.authToken);
    } catch (err) {
      console.error(err);
      const errorMessage = err || ["An unexpected error occurred."];
      navigate("/error", { state: { error: errorMessage } });
    }
  };

  return (
    <div className="Form">
      <h1 className="Form-title">You have been invited!</h1>
      <p className="Form-msg">Click the button to accept this invitation.</p>

      <Form
        onSubmit={async () => {
          navigate(`/projects/${+jobId}`, { replace: true });
        }}
      >
        <Button className="Form-btn" type="submit" onClick={handleSubmit}>
          Accept Invitation
        </Button>
      </Form>
    </div>
  );
}
