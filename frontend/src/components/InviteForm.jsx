import { Formik } from "formik";
import { Form, FormGroup, FormText, Label, Input, Button } from "reactstrap";
import { useNavigate, useParams } from "react-router-dom";
import ProPulseApi from "../api";
import "../styles/InviteForm.css";

export default function InviteForm() {
  const navigate = useNavigate();

  const { id } = useParams();

  return (
    <div className="Form">
      <h1 className="Form-title">Invite A User</h1>

      <Formik
        initialValues={{
          invited: "",
          privilege: "",
        }}
        validate={(values) => {
          const errors = {};

          if (!values.invited) {
            errors.invited = "Required";
          } else if (values.invited.length > 40) {
            errors.invited = "User email must be 40 characters or less.";
          } else if (values.invited.length < 6) {
            errors.invited = "User email must be at least 6 characters.";
          }

          if (!values.privilege) {
            errors.privilege = "Required";
          }

          return errors;
        }}
        onSubmit={async (values) => {
          try {
            await ProPulseApi.inviteUser(values, id);
            navigate(`/projects/${id}`, { replace: true });
          } catch (err) {
            console.error(err);
            const errorMessage = err || ["An unexpected error occurred."];
            navigate("/error", { state: { error: errorMessage } });
          }
        }}
      >
        {({ values, errors, touched, handleChange, handleSubmit }) => (
          <Form onSubmit={handleSubmit}>
            <FormGroup floating>
              <Input
                className="Form-input"
                id="invited"
                name="invited"
                placeholder="User Email"
                type="text"
                autoComplete="invited"
                value={values.invited}
                onChange={handleChange}
              />
              <Label className="Form-label" for="invited">
                User Email
              </Label>
              {errors.invited && touched.invited && (
                <div className="Form-error">
                  {errors.invited && touched.invited && errors.invited}
                </div>
              )}
            </FormGroup>
            <FormGroup floating>
              <Input
                className="Form-input"
                id="privilege"
                name="privilege"
                placeholder="Grant Privileges"
                type="select"
                autoComplete="privilege"
                value={values.privilege}
                onChange={handleChange}
              >
                <option value={""}>--Please Choose An Option--</option>
                <option>No</option>
                <option>Yes</option>
              </Input>
              <Label className="Form-label" for="privilege">
                Grant Privileges
              </Label>
              <FormText>
                *If yes, the user will be allowed to edit job information,
                invite/remove other users, and grant/revoke privileges. They
                should be a trusted user.
              </FormText>
              {errors.privilege && touched.privilege && (
                <div className="Form-error">
                  {errors.privilege && touched.privilege && errors.privilege}
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
