import { Formik } from "formik";
import { Form, FormGroup, Label, Input, Button } from "reactstrap";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import ProPulseApi from "../api";
import UserContext from "../contexts/UserContext";
import "../styles/JobForm.css";

export default function JobForm() {
  const { setToken, currentUser } = useContext(UserContext);
  const navigate = useNavigate();

  return (
    <div className="Form">
      <h1 className="Form-title">Create Your Project</h1>

      <Formik
        initialValues={{
          name: "",
          city: "",
          state: "",
          streetAddr: "",
        }}
        validate={(values) => {
          const errors = {};

          if (!values.name) {
            errors.name = "Required";
          } else if (values.name.length > 30) {
            errors.name = "Name must be 30 characters or less.";
          }

          if (values.city.length > 30) {
            errors.city = "City must be 30 characters or less.";
          }

          if (values.state.length > 2) {
            errors.state = "State must be 2 characters or less.";
          } else if (values.state !== "" && values.state.length < 2) {
            errors.state = "State must be at least 2 characters.";
          }

          if (values.streetAddr.length > 50) {
            errors.streetAddr = "Street address must be 50 characters or less.";
          } else if (values.streetAddr !== "" && values.streetAddr.length < 6) {
            errors.streetAddr = "Street address must be at least 6 characters.";
          }

          return errors;
        }}
        onSubmit={async (values) => {
          for (const key in values) {
            if (values[key] === "") {
              delete values[key];
            }
          }
          try {
            const res = await ProPulseApi.createJob(values);
            setToken(res.token);
            navigate(`/users/dashboard/${currentUser.id}`, { replace: true });
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
                id="name"
                name="name"
                placeholder="Project Name"
                type="text"
                autoComplete="name"
                value={values.name}
                onChange={handleChange}
              />
              <Label className="Form-label" for="name">
                Project Name
              </Label>
              {errors.name && touched.name && (
                <div className="Form-error">
                  {errors.name && touched.name && errors.name}
                </div>
              )}
            </FormGroup>
            <FormGroup floating>
              <Input
                className="Form-input"
                id="city"
                name="city"
                placeholder="City (optional)"
                type="text"
                autoComplete="city"
                value={values.city}
                onChange={handleChange}
              />
              <Label className="Form-label" for="city">
                City (optional)
              </Label>
              {errors.city && touched.city && (
                <div className="Form-error">
                  {errors.city && touched.city && errors.city}
                </div>
              )}
            </FormGroup>
            <FormGroup floating>
              <Input
                className="Form-input"
                id="state"
                name="state"
                placeholder="State (optional)"
                type="text"
                autoComplete="state"
                value={values.state}
                onChange={handleChange}
              />
              <Label className="Form-label" for="state">
                State (optional)
              </Label>
              {errors.state && touched.state && (
                <div className="Form-error">
                  {errors.state && touched.state && errors.state}
                </div>
              )}
            </FormGroup>
            <FormGroup floating>
              <Input
                className="Form-input"
                id="streetAddr"
                name="streetAddr"
                placeholder="Street Address (optional)"
                type="text"
                autoComplete="streetAddr"
                value={values.streetAddr}
                onChange={handleChange}
              />
              <Label className="Form-label" for="streetAddr">
                Street Address (optional)
              </Label>
              {errors.streetAddr && touched.streetAddr && (
                <div className="Form-error">
                  {errors.streetAddr && touched.streetAddr && errors.streetAddr}
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
