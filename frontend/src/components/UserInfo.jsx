import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Spinner,
  Card,
  CardTitle,
  ListGroup,
  ListGroupItem,
  ListGroupItemHeading,
  ListGroupItemText,
  Button,
} from "reactstrap";
import { v4 as uuid } from "uuid";
import ProPulseApi from "../api";
import "../styles/UserInfo.css";

export default function UserInfo() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function getUser() {
      try {
        const res = await ProPulseApi.getUser(id);
        setUser(res.user);
      } catch (err) {
        console.error(err);
        const errorMessage = err || "An unexpected error occurred.";
        navigate("/error", { state: { error: errorMessage } });
      } finally {
        setIsLoading(false);
      }
    }

    getUser();
  }, [id]);

  function goBack() {
    navigate(-1);
  }

  if (isLoading)
    return (
      <div className="User">
        <Spinner className="User-spinner" color="secondary">
          Loading...
        </Spinner>
      </div>
    );

  return (
    <div className="User">
      <Card className="User-card">
        <CardTitle className="User-title" tag="h1">
          <h1>{user.email}</h1>
          <h2>Contact Information</h2>
        </CardTitle>
        <ListGroup className="User-list">
          <ListGroupItem className="User-listItem" key={uuid()}>
            <ListGroupItemHeading className="User-listHeading">
              Details
            </ListGroupItemHeading>
            <ListGroupItemText className="User-listText">
              Name: {user.firstName} {user.lastName}
            </ListGroupItemText>
            <ListGroupItemText className="User-listText">
              Phone: {user.phone}
            </ListGroupItemText>
            <ListGroupItemText className="User-listText">
              Organization: {user.organization}
            </ListGroupItemText>
            <ListGroupItemText className="User-listText">
              Job Title: {user.title}
            </ListGroupItemText>
          </ListGroupItem>
        </ListGroup>
        <Button className="User-btn" onClick={goBack}>
          Go Back
        </Button>
      </Card>
    </div>
  );
}
