import { Link, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { Button, Spinner, ListGroup, ListGroupItem } from "reactstrap";
import UserContext from "../contexts/UserContext";
import ProPulseApi from "../api";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const { currentUser } = useContext(UserContext);
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState(null);

  const navigate = useNavigate();

  useEffect(
    function loadUserJobs() {
      async function getUserJobs() {
        try {
          let res = await ProPulseApi.getUserJobs(currentUser.id);
          setJobs(res.jobs);
        } catch (err) {
          console.error(err);
          const errorMessage = err || ["An unexpected error occurred."];
          navigate("/error", { state: { error: errorMessage } });
        } finally {
          setIsLoading(false);
        }
      }
      getUserJobs();
    },
    [currentUser.id, navigate]
  );

  if (isLoading)
    return (
      <div className="Dashboard">
        <Spinner className="Dashboard-spinner" color="secondary">
          Loading...
        </Spinner>
      </div>
    );

  return (
    <div className="Dashboard">
      <div className="Dashboard-banner">
        <h1 className="Dashboard-title">{currentUser.email}'s Dashboard</h1>
        <Button className="Dashboard-job-btn">
          <Link className="Dashboard-btn-link" to={`/newProject`}>
            Create A Project
          </Link>
        </Button>
      </div>

      {jobs.message && <h2 className="Dashboard-msg">{jobs.message}</h2>}
      {!jobs.message && <h2 className="Dashboard-msg">Your Projects</h2>}
      {!jobs.message && (
        <ListGroup className="Dashboard-job-list">
          {jobs.map((job) => (
            <ListGroupItem className="Dashboard-job-listItem" key={job.id}>
              <Link className="Dashboard-job-link" to={`/projects/${job.id}`}>
                {job.name}
              </Link>
            </ListGroupItem>
          ))}
        </ListGroup>
      )}
    </div>
  );
}
