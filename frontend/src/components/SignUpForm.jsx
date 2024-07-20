import { Formik } from "formik";
import { Form, FormGroup, Label, Input, InputGroup, Button } from "reactstrap";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/SignUpForm.css";

export default function SignUpForm({ signUp }) {
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  function togglePasswordVisibility() {
    setShowPassword(!showPassword);
  }

  return (
    <div className="Form">
      <h1 className="Form-title">Create your ProPulse account!</h1>
      <p>
        Already a registered user? Login <Link to="/login">here</Link>.
      </p>
      <Formik
        initialValues={{
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          phone: "",
          organization: "",
          title: "",
        }}
        validate={(values) => {
          const errors = {};

          if (!values.firstName) {
            errors.firstName = "Required";
          } else if (values.firstName.length > 30) {
            errors.firstName = "First name must be 30 characters or less.";
          }

          if (!values.lastName) {
            errors.lastName = "Required";
          } else if (values.lastName.length > 30) {
            errors.lastName = "Last name must be 30 characters or less.";
          }

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

          if (!values.phone) {
            errors.phone = "Required";
          } else if (values.phone.length > 17) {
            errors.phone = "Phone number must be 17 characters or less.";
          } else if (values.phone.length < 10) {
            errors.phone = "Phone number must be at least 10 characters.";
          }

          if (!values.organization) {
            errors.organization = "Required";
          } else if (values.organization.length > 30) {
            errors.organization = "Organization must be 30 characters or less.";
          }

          if (!values.title) {
            errors.title = "Required";
          } else if (values.title.length > 30) {
            errors.title = "Title must be 30 characters or less.";
          } else if (values.title.length < 5) {
            errors.title = "Title must be at least 5 characters.";
          }

          return errors;
        }}
        onSubmit={async (values) => {
          try {
            await signUp(values);
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
                id="firstName"
                name="firstName"
                placeholder="First Name"
                type="text"
                value={values.firstName}
                onChange={handleChange}
              />
              <Label className="Form-label" for="firstName">
                First Name
              </Label>
              {errors.firstName && touched.firstName && (
                <div className="Form-error">
                  {errors.firstName && touched.firstName && errors.firstName}
                </div>
              )}
            </FormGroup>
            <FormGroup floating>
              <Input
                className="Form-input"
                id="lastName"
                name="lastName"
                placeholder="Last Name"
                type="text"
                value={values.lastName}
                onChange={handleChange}
              />
              <Label className="Form-label" for="lastName">
                Last Name
              </Label>
              {errors.lastName && touched.lastName && (
                <div className="Form-error">
                  {errors.lastName && touched.lastName && errors.lastName}
                </div>
              )}
            </FormGroup>
            <FormGroup floating>
              <Input
                className="Form-input"
                id="phone"
                name="phone"
                placeholder="Phone"
                type="text"
                value={values.phone}
                onChange={handleChange}
              />
              <Label className="Form-label" for="phone">
                Phone
              </Label>
              {errors.phone && touched.phone && (
                <div className="Form-error">
                  {errors.phone && touched.phone && errors.phone}
                </div>
              )}
            </FormGroup>
            <FormGroup floating>
              <Input
                className="Form-input"
                id="organization"
                name="organization"
                placeholder="Organization"
                type="text"
                value={values.organization}
                onChange={handleChange}
              />
              <Label className="Form-label" for="organization">
                Organization
              </Label>
              {errors.organization && touched.organization && (
                <div className="Form-error">
                  {errors.organization &&
                    touched.organization &&
                    errors.organization}
                </div>
              )}
            </FormGroup>
            <FormGroup floating>
              <Input
                className="Form-input"
                id="title"
                name="title"
                placeholder="Job Title"
                type="text"
                value={values.title}
                onChange={handleChange}
              />
              <Label className="Form-label" for="title">
                Job Title
              </Label>
              {errors.title && touched.title && (
                <div className="Form-error">
                  {errors.title && touched.title && errors.title}
                </div>
              )}
            </FormGroup>
            <FormGroup floating>
              <Input
                className="Form-input"
                id="email"
                name="email"
                placeholder="Email"
                type="text"
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
