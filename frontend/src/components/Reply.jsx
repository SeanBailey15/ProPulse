import { Link } from "react-router-dom";
import { Card, CardTitle, CardBody, CardText } from "reactstrap";
import "../styles/Reply.css";

export default function Reply({ reply }) {
  const date = new Date(reply.datePosted);
  return (
    <div className="Reply">
      <Link className="Reply-card-link" to={`/replies/${reply.id}`}>
        <Card className="Reply-card">
          <CardBody className="Reply-body">
            <CardTitle className="Reply-title">
              Posted By: {reply.postedBy} <br />
              Posted On: {date.toDateString()}
            </CardTitle>

            <CardText className="Reply-text" key={reply.id}>
              {reply.content}
            </CardText>
          </CardBody>
        </Card>
      </Link>
    </div>
  );
}
