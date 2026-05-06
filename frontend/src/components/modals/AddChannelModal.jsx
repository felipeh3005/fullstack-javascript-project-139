import axios from 'axios';
import { Formik } from 'formik';
import {
  Button,
  Form as BootstrapForm,
  Modal,
} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';

import { useAuth } from '../../contexts/AuthContext';
import {
  addChannel,
  selectChannels,
  setCurrentChannelId,
} from '../../slices/chatSlice';

const getValidationSchema = (channels) => {
  const channelNames = channels.map(({ name }) => name.toLowerCase());

  return yup.object().shape({
    name: yup
      .string()
      .trim()
      .required('Required')
      .min(3, 'From 3 to 20 characters')
      .max(20, 'From 3 to 20 characters')
      .test('unique', 'Must be unique', (value) => {
        if (!value) {
          return true;
        }

        return !channelNames.includes(value.trim().toLowerCase());
      }),
  });
};

const AddChannelModal = ({ show, onHide }) => {
  const dispatch = useDispatch();
  const channels = useSelector(selectChannels) ?? [];
  const { user } = useAuth();

  if (!show) {
    return null;
  }

  const handleSubmit = async (values, { setFieldError, setSubmitting }) => {
    const name = values.name.trim();

    try {
      const response = await axios.post(
        '/api/v1/channels',
        { name },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );

      dispatch(addChannel(response.data));
      dispatch(setCurrentChannelId(response.data.id));
      onHide();
    } catch {
      setFieldError('name', 'Network error');
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{ name: '' }}
      validationSchema={getValidationSchema(channels)}
      onSubmit={handleSubmit}
    >
      {({
        errors,
        handleBlur,
        handleChange,
        handleSubmit: submitForm,
        isSubmitting,
        touched,
        values,
      }) => (
        <Modal
          show={show}
          centered
          onHide={isSubmitting ? undefined : onHide}
          backdrop={isSubmitting ? 'static' : true}
          keyboard={!isSubmitting}
        >
          <BootstrapForm noValidate onSubmit={submitForm}>
            <Modal.Header closeButton={!isSubmitting}>
              <Modal.Title>Add channel</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <BootstrapForm.Group>
                <BootstrapForm.Label htmlFor="add-channel-name">
                  Channel name
                </BootstrapForm.Label>
                <BootstrapForm.Control
                  id="add-channel-name"
                  name="name"
                  autoFocus
                  value={values.name}
                  disabled={isSubmitting}
                  isInvalid={touched.name && Boolean(errors.name)}
                  onBlur={handleBlur}
                  onChange={handleChange}
                />
                <BootstrapForm.Control.Feedback type="invalid">
                  {errors.name}
                </BootstrapForm.Control.Feedback>
              </BootstrapForm.Group>
            </Modal.Body>

            <Modal.Footer>
              <Button
                type="button"
                variant="secondary"
                disabled={isSubmitting}
                onClick={onHide}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create'}
              </Button>
            </Modal.Footer>
          </BootstrapForm>
        </Modal>
      )}
    </Formik>
  );
};

export default AddChannelModal;