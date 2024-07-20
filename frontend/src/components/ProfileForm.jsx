import { Formik } from "formik";
import {
  Form,
  FormGroup,
  FormText,
  Label,
  Input,
  InputGroup,
  Button,
} from "reactstrap";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../contexts/UserContext";
import JoblyApi from "../api";
import "../styles/ProfileForm.css";

export default function ProfileForm() {
  const { currentUser, setCurrentUser } = useContext(UserContext);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmed, setShowConfirmed] = useState(false);

  const navigate = useNavigate();

  function togglePasswordVisibility() {
    setShowPassword(!showPassword);
  }
  function toggleConfirmedVisibility() {
    setShowConfirmed(!showConfirmed);
  }

  async function updateProfile(formData) {
    const username = currentUser.username;
    const updatedUser = await JoblyApi.updateProfile(username, formData);
    return updatedUser;
  }

  return (
    <div className="Form">
      <h1 className="Form-title">{`${currentUser.username}'s Profile`}</h1>
      <h2 className="Form-msg">Edit Your Information:</h2>
      <Formik
        initialValues={{
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          email: currentUser.email,
          password: "",
          confirmPassword: "",
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
          } else if (values.email.length > 60) {
            errors.email = "Email must be 60 characters or less.";
          }

          if (!values.password) {
            errors.password = "Required";
          } else if (values.password.length > 20) {
            errors.password = "Password must be 20 characters or less.";
          } else if (values.password.length < 5) {
            errors.password = "Password must be 5 characters or more.";
          } else if (values.password !== values.confirmPassword) {
            errors.confirmPassword = "Passwords do not match";
          }

          if (!values.confirmPassword) {
            errors.confirmPassword = "Required";
          } else if (values.confirmPassword.length > 20) {
            errors.confirmPassword = "Password must be 20 characters or less.";
          } else if (values.confirmPassword.length < 5) {
            errors.confirmPassword = "Password must be 5 characters or more.";
          } else if (values.confirmPassword !== values.password) {
            errors.confirmPassword = "Passwords do not match";
          }

          return errors;
        }}
        onSubmit={async (values) => {
          let data;
          try {
            if (values.password === values.confirmPassword) {
              data = {
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                password: values.password,
              };
            }
            setCurrentUser(await updateProfile(data));
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
                  Password*
                </Label>
                <FormText>
                  *Here you can change your password, if you like. Use your
                  current password otherwise.
                </FormText>
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
            <InputGroup>
              <FormGroup floating>
                <Input
                  className="Form-input"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="confirmPassword"
                  type={showConfirmed ? "text" : "password"}
                  autoComplete="current-password"
                  value={values.confirmPassword}
                  onChange={handleChange}
                />
                <Label className="Form-label" for="confirmPassword">
                  Confirm Password
                </Label>
                {errors.confirmPassword && touched.confirmPassword && (
                  <div className="Form-error">
                    {errors.confirmPassword &&
                      touched.confirmPassword &&
                      errors.confirmPassword}
                  </div>
                )}
              </FormGroup>
              <Button
                className="Form-input-btn"
                onClick={toggleConfirmedVisibility}
              >
                {showConfirmed ? (
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
