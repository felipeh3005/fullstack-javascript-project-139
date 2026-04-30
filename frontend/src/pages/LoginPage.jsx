import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as yup from 'yup';

const validationSchema = yup.object().shape({
  username: yup.string().trim().required('Username is required'),
  password: yup.string().required('Password is required'),
});

const LoginPage = () => {
  const handleSubmit = () => {
    // Form submission will be implemented in a later step.
  };

  return (
    <div className="container-fluid vh-100">
      <div className="row justify-content-center align-content-center h-100">
        <div className="col-12 col-md-8 col-lg-6 col-xl-4">
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h1 className="h3 mb-4 text-center">Login</h1>

              <Formik
                initialValues={{ username: '', password: '' }}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
              >
                {({ isSubmitting }) => (
                  <Form>
                    <div className="form-floating mb-3">
                      <Field
                        id="username"
                        name="username"
                        type="text"
                        autoComplete="username"
                        placeholder="Username"
                        className="form-control"
                      />
                      <label htmlFor="username">Username</label>
                      <ErrorMessage
                        name="username"
                        component="div"
                        className="invalid-feedback d-block"
                      />
                    </div>

                    <div className="form-floating mb-4">
                      <Field
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        placeholder="Password"
                        className="form-control"
                      />
                      <label htmlFor="password">Password</label>
                      <ErrorMessage
                        name="password"
                        component="div"
                        className="invalid-feedback d-block"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-100 btn btn-primary"
                      disabled={isSubmitting}
                    >
                      Submit
                    </button>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;