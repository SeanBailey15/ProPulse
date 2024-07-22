import { Link, useNavigate, useParams } from "react-router-dom";
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
import "../styles/ReplyDetails.css";

export default function ReplyDetails() {
  const [reply, setReply] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function getReply() {
      try {
        const res = await ProPulseApi.getReply(id);
        setReply(res.reply);
      } catch (err) {
        console.error(err);
        const errorMessage = err || ["An unexpected error occurred."];
        navigate("/error", { state: { error: errorMessage } });
      } finally {
        setIsLoading(false);
      }
    }

    getReply();
  }, [id]);

  console.log(reply);

  if (isLoading)
    return (
      <div className="ReplyDetails">
        <Spinner className="ReplyDetails-spinner" color="secondary">
          Loading...
        </Spinner>
      </div>
    );

  const date = new Date(reply.datePosted);

  return (
    <div className="ReplyDetails">
      <Card className="ReplyDetails-card">
        <CardTitle className="ReplyDetails-title">
          Reply By:{" "}
          <Link
            className="ReplyDetails-link"
            to={`/users/info/${reply.creatorId}`}
          >
            {reply.createdBy}
          </Link>{" "}
          <br />
          Replied On: {date.toDateString()} <br />
          See Original Post{" "}
          <Link className="ReplyDetails-link" to={`/posts/${reply.replyTo}`}>
            Here
          </Link>
        </CardTitle>
        <ListGroup className="ReplyDetails-list">
          <ListGroupItem className="ReplyDetails-listItem" key={uuid()}>
            <ListGroupItemText className="ReplyDetails-listText">
              {reply.content}
            </ListGroupItemText>
          </ListGroupItem>
        </ListGroup>
      </Card>
    </div>
  );
}
