import { Formik } from "formik";
import { Form, FormGroup, FormText, Label, Input, Button } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import ProPulseApi from "../api";
import "../styles/PostForm.css";

export default function PostForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <div className="Form">
      <h1 className="Form-title">Create A Post</h1>

      <Formik
        initialValues={{
          content: "",
          tagged: "",
        }}
        validate={(values) => {
          const errors = {};

          if (!values.content) {
            errors.content = "Required";
          }

          return errors;
        }}
        onSubmit={async (values) => {
          try {
            let taggedArray = values.tagged.split(",");
            values.tagged = taggedArray;
            await ProPulseApi.createPost(values, id);
            navigate(`/projects/${id}`, { replace: true });
          } catch (err) {
            console.error(err);
            const errorMessage = err || "An unexpected error occurred.";
            navigate("/error", { state: { error: errorMessage } });
          }
        }}
      >
        {({ values, errors, touched, handleChange, handleSubmit }) => (
          <Form onSubmit={handleSubmit}>
            <FormGroup floating>
              <Input
                className="Form-input"
                id="content"
                name="content"
                placeholder="Content"
                type="textarea"
                autoComplete="content"
                value={values.content}
                onChange={handleChange}
              />
              <Label className="Form-label" for="content">
                Content
              </Label>
              {errors.content && touched.content && (
                <div className="Form-error">
                  {errors.content && touched.content && errors.content}
                </div>
              )}
            </FormGroup>
            <FormGroup floating>
              <Input
                className="Form-input"
                id="tagged"
                name="tagged"
                placeholder="Tag Users (optional)"
                type="text"
                autoComplete="tagged"
                value={values.tagged}
                onChange={handleChange}
              />
              <Label className="Form-label" for="tagged">
                Tag Users (optional)
              </Label>
              <FormText>
                Enter a user's email here. If you want to tag multiple users,
                separate their emails with a comma.
                <em>ex: tom@email.com, jane@email.com</em>
              </FormText>
              {errors.tagged && touched.tagged && (
                <div className="Form-error">
                  {errors.tagged && touched.tagged && errors.tagged}
                </div>
              )}
            </FormGroup>

            <Button className="Form-btn" type="submit">
              Submit
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
