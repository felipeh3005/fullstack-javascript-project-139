import axios from 'axios';
import { Formik } from 'formik';
import {
  Alert,
  Button,
  Card,
  Container,
  Form as BootstrapForm,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';

import { useAuth } from '../contexts/AuthContext';

const validationSchema = yup.object().shape({
  username: yup
    .string()
    .trim()
    .required('Required')
    .min(3, 'From 3 to 20 characters')
    .max(20, 'From 3 to 20 characters'),
  password: yup
    .string()
    .required('Required')
    .min(6, 'At least 6 characters'),
  confirmPassword: yup
    .string()
    .required('Required')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

const SignupPage = () => {
  const navigate = useNavigate();
  const { logIn } = useAuth();

  const handleSubmit = async (
    { username, password },
    { setFieldError, setStatus, setSubmitting },
  ) => {
    setStatus(null);

    try {
      const response = await axios.post('/api/v1/signup', {
        username: username.trim(),
        password,
      });

      logIn(response.data);
      navigate('/');
    } catch (error) {
      if (error.response?.status === 409) {
        setFieldError('username', 'User already exists');
      } else {
        setStatus('Network error. Try again.');
      }

      setSubmitting(false);
    }
  };

  return (
    <Container className="py-5">
      <Card className="mx-auto shadow-sm" style={{ maxWidth: '420px' }}>
        <Card.Body>
          <h1 className="h3 mb-4 text-center">Sign up</h1>

          <Formik
            initialValues={{
              username: '',
              password: '',
              confirmPassword: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({
              errors,
              handleBlur,
              handleChange,
              handleSubmit: submitForm,
              isSubmitting,
              status,
              touched,
              values,
            }) => (
              <BootstrapForm noValidate onSubmit={submitForm}>
                {status && (
                  <Alert variant="danger">
                    {status}
                  </Alert>
                )}

                <BootstrapForm.Group className="mb-3">
                  <BootstrapForm.Label htmlFor="signup-username">
                    Username
                  </BootstrapForm.Label>
                  <BootstrapForm.Control
                    id="signup-username"
                    name="username"
                    autoFocus
                    value={values.username}
                    disabled={isSubmitting}
                    isInvalid={touched.username && Boolean(errors.username)}
                    onBlur={handleBlur}
                    onChange={handleChange}
                  />
                  <BootstrapForm.Control.Feedback type="invalid">
                    {errors.username}
                  </BootstrapForm.Control.Feedback>
                </BootstrapForm.Group>

                <BootstrapForm.Group className="mb-3">
                  <BootstrapForm.Label htmlFor="signup-password">
                    Password
                  </BootstrapForm.Label>
                  <BootstrapForm.Control
                    id="signup-password"
                    name="password"
                    type="password"
                    value={values.password}
                    disabled={isSubmitting}
                    isInvalid={touched.password && Boolean(errors.password)}
                    onBlur={handleBlur}
                    onChange={handleChange}
                  />
                  <BootstrapForm.Control.Feedback type="invalid">
                    {errors.password}
                  </BootstrapForm.Control.Feedback>
                </BootstrapForm.Group>

                <BootstrapForm.Group className="mb-4">
                  <BootstrapForm.Label htmlFor="signup-confirm-password">
                    Confirm password
                  </BootstrapForm.Label>
                  <BootstrapForm.Control
                    id="signup-confirm-password"
                    name="confirmPassword"
                    type="password"
                    value={values.confirmPassword}
                    disabled={isSubmitting}
                    isInvalid={touched.confirmPassword && Boolean(errors.confirmPassword)}
                    onBlur={handleBlur}
                    onChange={handleChange}
                  />
                  <BootstrapForm.Control.Feedback type="invalid">
                    {errors.confirmPassword}
                  </BootstrapForm.Control.Feedback>
                </BootstrapForm.Group>

                <Button type="submit" className="w-100" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating account...' : 'Sign up'}
                </Button>
              </BootstrapForm>
            )}
          </Formik>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default SignupPage;