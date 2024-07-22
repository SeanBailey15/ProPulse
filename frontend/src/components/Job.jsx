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
import Post from "./Post";
import "../styles/Job.css";

export default function Job() {
  const [job, setJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function getJob() {
      try {
        const res = await ProPulseApi.getJob(id);
        setJob(res.job);
      } catch (err) {
        console.error(err);
        const errorMessage = err || "An unexpected error occurred.";
        navigate("/error", { state: { error: errorMessage } });
      } finally {
        setIsLoading(false);
      }
    }

    getJob();
  }, [id]);

  if (isLoading)
    return (
      <div className="Job">
        <Spinner className="Job-spinner" color="secondary">
          Loading...
        </Spinner>
      </div>
    );

  return (
    <div className="Job">
      <Card className="Job-card">
        <CardTitle className="Job-title" tag="h1">
          {job.name}
        </CardTitle>
        <ListGroup className="Job-list">
          <ListGroupItem className="Job-listItem" key={uuid()}>
            <ListGroupItemHeading className="Job-listHeading">
              Location
            </ListGroupItemHeading>
            {job.city && (
              <ListGroupItemText className="Job-listText">
                City: {job.city}
              </ListGroupItemText>
            )}
            {job.state && (
              <ListGroupItemText className="Job-listText">
                State: {job.state.toUpperCase()}
              </ListGroupItemText>
            )}
            {job.streetAddr && (
              <ListGroupItemText className="Job-listText">
                Address: {job.streetAddr}
              </ListGroupItemText>
            )}
            {!job.city && !job.state && !job.streetAddr && (
              <ListGroupItemText className="Job-listText">
                Not Specified
              </ListGroupItemText>
            )}
          </ListGroupItem>
          <ListGroupItem className="Job-listItem" key={uuid()}>
            <ListGroupItemHeading className="Job-listHeading">
              ProPulse Admin
            </ListGroupItemHeading>
            <ListGroupItemText className="Job-listText">
              <Link className="Job-userLink" to={`/users/info/${job.adminId}`}>
                {job.adminEmail}
              </Link>
            </ListGroupItemText>
          </ListGroupItem>
        </ListGroup>
        <Button className="Form-btn">
          <Link className="Job-btn-link" to={`/projects/${id}/createPost`}>
            Create A Post
          </Link>
        </Button>
        {job.posts && (
          <>
            <ListGroup className="Job-list-post">
              <ListGroupItem className="Job-listItem-post" key={uuid()}>
                <ListGroupItemHeading className="Job-listHeading-post">
                  Posts
                </ListGroupItemHeading>
              </ListGroupItem>
              {job.posts.map((post) => (
                <ListGroupItem className="Job-listItem-postItem" key={post.id}>
                  <Post post={post} />
                </ListGroupItem>
              ))}
            </ListGroup>
          </>
        )}
      </Card>
    </div>
  );
}
