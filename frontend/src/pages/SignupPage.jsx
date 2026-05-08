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
  username: yup
    .string()
    .trim()
    .required(t('validation.required'))
    .min(3, t('validation.usernameLength'))
    .max(20, t('validation.usernameLength')),
  password: yup
    .string()
    .required(t('validation.required'))
    .min(6, t('validation.passwordMin')),
  confirmPassword: yup
    .string()
    .required(t('validation.required'))
    .oneOf([yup.ref('password')], t('validation.passwordsMustMatch')),
});

const SignupPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
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
        setFieldError('username', t('signup.userExists'));
      } else {
        setStatus(t('signup.networkError'));
      }

      setSubmitting(false);
    }
  };

  return (
    <Container className="py-5">
      <Card className="mx-auto shadow-sm" style={{ maxWidth: '420px' }}>
        <Card.Body>
          <h1 className="h3 mb-4 text-center">{t('signup.title')}</h1>

          <Formik
            initialValues={{
              username: '',
              password: '',
              confirmPassword: '',
            }}
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
                  <BootstrapForm.Label htmlFor="signup-username">
                    {t('signup.username')}
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
                    {t('signup.password')}
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
                    {t('signup.confirmPassword')}
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
                  {isSubmitting ? t('signup.submitting') : t('signup.submit')}
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
