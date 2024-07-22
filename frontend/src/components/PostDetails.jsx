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
import Reply from "./Reply";
import "../styles/PostDetails.css";

export default function PostDetails() {
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function getPost() {
      try {
        const res = await ProPulseApi.getPost(id);
        setPost(res.post);
      } catch (err) {
        console.error(err);
        const errorMessage = err || ["An unexpected error occurred."];
        navigate("/error", { state: { error: errorMessage } });
      } finally {
        setIsLoading(false);
      }
    }

    getPost();
  }, [id]);

  console.log(post);

  if (isLoading)
    return (
      <div className="PostDetails">
        <Spinner className="PostDetails-spinner" color="secondary">
          Loading...
        </Spinner>
      </div>
    );

  const date = new Date(post.datePosted);

  return (
    <div className="PostDetails">
      <Card className="PostDetails-card">
        <CardTitle className="PostDetails-title">
          Posted By:{" "}
          <Link
            className="PostDetails-link"
            to={`/users/info/${post.creatorId}`}
          >
            {post.createdBy}
          </Link>{" "}
          <br />
          Posted On: {date.toDateString()} <br />
          Job Name:{" "}
          <Link className="PostDetails-link" to={`/projects/${post.jobId}`}>
            {post.jobName}
          </Link>
        </CardTitle>
        <ListGroup className="PostDetails-list">
          <ListGroupItem className="PostDetails-listItem" key={uuid()}>
            <ListGroupItemText className="PostDetails-listText">
              {post.content}
            </ListGroupItemText>
          </ListGroupItem>
        </ListGroup>
        <Button className="Form-btn">
          <Link
            className="PostDetails-btn-link"
            to={`/posts/${id}/createReply`}
          >
            Create A Reply
          </Link>
        </Button>
        {post.replies && (
          <>
            <ListGroup className="PostDetails-list-reply">
              <ListGroupItem
                className="PostDetails-listItem-reply"
                key={uuid()}
              >
                <ListGroupItemHeading className="PostDetails-listHeading-reply">
                  Replies
                </ListGroupItemHeading>
              </ListGroupItem>
              {post.replies.map((reply) => (
                <ListGroupItem
                  className="replyDetails-listItem-replyItem"
                  key={reply.id}
                >
                  <Reply reply={reply} />
                </ListGroupItem>
              ))}
            </ListGroup>
          </>
        )}
      </Card>
    </div>
  );
}
