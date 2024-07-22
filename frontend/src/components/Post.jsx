import { Link } from "react-router-dom";
import { Card, CardTitle, CardBody, CardText } from "reactstrap";
import "../styles/Post.css";

export default function Post({ post }) {
  const date = new Date(post.datePosted);
  return (
    <div className="Post">
      <Link className="Post-card-link" to={`/posts/${post.id}`}>
        <Card className="Post-card">
          <CardBody className="Post-body">
            <CardTitle className="Post-title">
              Posted By: {post.postedBy} <br />
              Posted On: {date.toDateString()}
            </CardTitle>

            <CardText className="Post-text" key={post.id}>
              {post.content}
            </CardText>
          </CardBody>
        </Card>
      </Link>
    </div>
  );
}
