import axios from 'axios';
import { useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Container,
  FloatingLabel,
  Form as BootstrapForm,
} from 'react-bootstrap';
import { Field, Form as FormikForm, Formik } from 'formik';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import * as yup from 'yup';

import { useAuth } from '../contexts/AuthContext';

const validationSchema = yup.object().shape({
  username: yup.string().trim().required('Username is required'),
  password: yup.string().required('Password is required'),
});

const LoginPage = () => {
  const [authFailed, setAuthFailed] = useState(false);
  const { logIn, loggedIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  if (loggedIn) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (values, { setSubmitting }) => {
    setAuthFailed(false);

    try {
      const response = await axios.post('/api/v1/login', values);

      logIn(response.data);
      navigate(from, { replace: true });
    } catch (error) {
      setAuthFailed(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container fluid className="vh-100">
      <div className="row justify-content-center align-content-center h-100">
        <div className="col-12 col-md-8 col-lg-6 col-xl-4">
          <Card className="shadow-sm">
            <Card.Body className="p-4">
              <h1 className="h3 mb-4 text-center">Login</h1>

              {authFailed && (
                <Alert variant="danger">
                  Invalid username or password
                </Alert>
              )}

              <Formik
                initialValues={{ username: '', password: '' }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <FormikForm>
                    <Field name="username">
                      {({ field, meta }) => (
                        <FloatingLabel
                          controlId="username"
                          label="Username"
                          className="mb-3"
                        >
                          <BootstrapForm.Control
                            {...field}
                            type="text"
                            placeholder="Username"
                            autoComplete="username"
                            autoFocus
                            isInvalid={meta.touched && Boolean(meta.error)}
                          />
                          <BootstrapForm.Control.Feedback type="invalid">
                            {meta.error}
                          </BootstrapForm.Control.Feedback>
                        </FloatingLabel>
                      )}
                    </Field>

                    <Field name="password">
                      {({ field, meta }) => (
                        <FloatingLabel
                          controlId="password"
                          label="Password"
                          className="mb-4"
                        >
                          <BootstrapForm.Control
                            {...field}
                            type="password"
                            placeholder="Password"
                            autoComplete="current-password"
                            isInvalid={meta.touched && Boolean(meta.error)}
                          />
                          <BootstrapForm.Control.Feedback type="invalid">
                            {meta.error}
                          </BootstrapForm.Control.Feedback>
                        </FloatingLabel>
                      )}
                    </Field>

                    <Button
                      type="submit"
                      variant="primary"
                      className="w-100"
                      disabled={isSubmitting}
                    >
                      Submit
                    </Button>
                  </FormikForm>
                )}
              </Formik>
            </Card.Body>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default LoginPage;