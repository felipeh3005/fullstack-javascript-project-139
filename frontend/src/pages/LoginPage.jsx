import axios from 'axios';
import { Formik } from 'formik';
import {
  Alert,
  Button,
  Card,
  Container,
  Form as BootstrapForm,
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';

import { useAuth } from '../contexts/AuthContext';

const getValidationSchema = (t) => yup.object().shape({
  username: yup.string().required(t('validation.required')),
  password: yup.string().required(t('validation.required')),
});

const LoginPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { logIn } = useAuth();

  const handleSubmit = async (values, { setStatus, setSubmitting }) => {
    setStatus(null);

    try {
      const response = await axios.post('/api/v1/login', values);

      logIn(response.data);
      navigate('/');
    } catch {
      setStatus(t('auth.invalidCredentials'));
      setSubmitting(false);
    }
  };

  const handleSignupClick = (event) => {
    event.preventDefault();
    window.location.href = '/signup';
  };

  return (
    <Container className="py-5">
      <Card className="mx-auto shadow-sm" style={{ maxWidth: '420px' }}>
        <Card.Body>
          <h1 className="h3 mb-4 text-center">{t('auth.loginTitle')}</h1>

          <Formik
            initialValues={{ username: '', password: '' }}
            validationSchema={getValidationSchema(t)}
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
                  <BootstrapForm.Label htmlFor="username">
                    {t('auth.username')}
                  </BootstrapForm.Label>
                  <BootstrapForm.Control
                    id="username"
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

                <BootstrapForm.Group className="mb-4">
                  <BootstrapForm.Label htmlFor="password">
                    {t('auth.password')}
                  </BootstrapForm.Label>
                  <BootstrapForm.Control
                    id="password"
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

                <Button type="submit" className="w-100" disabled={isSubmitting}>
                  {isSubmitting ? t('auth.submittingLogin') : t('auth.submitLogin')}
                </Button>
              </BootstrapForm>
            )}
          </Formik>
        </Card.Body>

        <a
          href="/signup"
          className="card-footer text-center d-block text-decoration-none"
          onClick={handleSignupClick}
        >
          {t('auth.signupLink')}
        </a>
      </Card>
    </Container>
  );
};

export default LoginPage;