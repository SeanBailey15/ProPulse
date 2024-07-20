import { Formik } from "formik";
import { Form, FormGroup, Label, Input, InputGroup, Button } from "reactstrap";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/LoginForm.css";

export default function LoginForm({ login }) {
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  function togglePasswordVisibility() {
    setShowPassword(!showPassword);
  }

  return (
    <div className="Form">
      <h1 className="Form-title">Login to access Jobly opportunities!</h1>
      <p>
        Not a registered user yet? Sign up <Link to="/signup">here</Link>.
      </p>
      <Formik
        initialValues={{
          username: "",
          password: "",
        }}
        validate={(values) => {
          const errors = {};

          if (!values.username) {
            errors.username = "Required";
          } else if (values.username.length > 30) {
            errors.username = "Username must be 30 characters or less.";
          }

          if (!values.password) {
            errors.password = "Required";
          } else if (values.password.length > 20) {
            errors.password = "Password must be 20 characters or less.";
          } else if (values.password.length < 5) {
            errors.password = "Password must be 5 characters or more.";
          }

          return errors;
        }}
        onSubmit={async (values) => {
          try {
            await login(values);
            navigate("/", { replace: true });
          } catch (err) {
            console.error(err);
            navigate("/error", { state: { error: err } });
          }
        }}
      >
        {({ values, errors, touched, handleChange, handleSubmit }) => (
          <Form onSubmit={handleSubmit}>
            <FormGroup floating>
              <Input
                className="Form-input"
                id="username"
                name="username"
                placeholder="Username"
                type="text"
                autoComplete="username"
                value={values.username}
                onChange={handleChange}
              />
              <Label className="Form-label" for="username">
                Username
              </Label>
              {errors.username && touched.username && (
                <div className="Form-error">
                  {errors.username && touched.username && errors.username}
                </div>
              )}
            </FormGroup>
            <InputGroup>
              <FormGroup floating>
                <Input
                  className="Form-input"
                  id="password"
                  name="password"
                  placeholder="Password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={values.password}
                  onChange={handleChange}
                />
                <Label className="Form-label" for="password">
                  Password
                </Label>
                {errors.password && touched.password && (
                  <div className="Form-error">
                    {errors.password && touched.password && errors.password}
                  </div>
                )}
              </FormGroup>
              <Button
                className="Form-input-btn"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <span className="material-symbols-outlined">
                    visibility_off
                  </span>
                ) : (
                  <span className="material-symbols-outlined">visibility</span>
                )}
              </Button>
            </InputGroup>

            <Button className="Form-btn" type="submit">
              Submit
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
