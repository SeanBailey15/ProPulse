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
      <h1 className="Form-title">Login to access ProPulse!</h1>
      <p>
        Not a registered user yet? Sign up <Link to="/signup">here</Link>.
      </p>
      <Formik
        initialValues={{
          email: "",
          password: "",
        }}
        validate={(values) => {
          const errors = {};

          if (!values.email) {
            errors.email = "Required";
          } else if (
            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(values.email)
          ) {
            errors.email = "Invalid email address.";
          } else if (values.email.length < 6) {
            errors.email = "Email must be 6 characters or more.";
          } else if (values.email.length > 40) {
            errors.email = "Email must be 40 characters or less.";
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
                id="email"
                name="email"
                placeholder="Email"
                type="text"
                autoComplete="email"
                value={values.email}
                onChange={handleChange}
              />
              <Label className="Form-label" for="email">
                Email
              </Label>
              {errors.email && touched.email && (
                <div className="Form-error">
                  {errors.email && touched.email && errors.email}
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
