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
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import UserContext from "../contexts/UserContext";
import ProPulseApi from "../api";
import "../styles/ProfileForm.css";

export default function ProfileForm() {
  const { currentUser, setCurrentUser, token, setToken } =
    useContext(UserContext);

  const navigate = useNavigate();

  async function updateProfile(formData) {
    const id = currentUser.id;
    const update = await ProPulseApi.updateProfile(id, formData);
    return update;
  }

  return (
    <div className="Form">
      <h1 className="Form-title">{`${currentUser.email}'s Profile`}</h1>
      <h2 className="Form-msg">Edit Your Information:</h2>
      <Formik
        initialValues={{
          firstName: currentUser.firstName,
          lastName: currentUser.lastName,
          email: currentUser.email,
          phone: currentUser.phone,
          organization: currentUser.organization,
          title: currentUser.title,
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
          let data;
          try {
            data = {
              firstName: values.firstName,
              lastName: values.lastName,
              email: values.email,
              phone: values.phone,
              organization: values.organization,
              title: values.title,
            };
            const res = await updateProfile(data);
            setCurrentUser(res.user);
            setToken(res.token);
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
                autoComplete="phone"
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
                autoComplete="organization"
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
                placeholder="Title"
                type="text"
                autoComplete="title"
                value={values.title}
                onChange={handleChange}
              />
              <Label className="Form-label" for="title">
                Title
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
            <Button className="Form-btn" type="submit">
              Submit
            </Button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
