import axios from 'axios';
import { Formik } from 'formik';
import {
  Button,
  Form as BootstrapForm,
  Modal,
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import * as yup from 'yup';

import { useAuth } from '../../contexts/AuthContext';
import {
  addChannel,
  selectChannels,
  setCurrentChannelId,
} from '../../slices/chatSlice';

const getValidationSchema = (channels, t) => {
  const channelNames = channels.map(({ name }) => name.toLowerCase());

  return yup.object().shape({
    name: yup
      .string()
      .trim()
      .required(t('validation.required'))
      .min(3, t('validation.usernameLength'))
      .max(20, t('validation.usernameLength'))
      .test('unique', t('validation.unique'), (value) => {
        if (!value) {
          return true;
        }

        return !channelNames.includes(value.trim().toLowerCase());
      }),
  });
};

const AddChannelModal = ({ show, onHide }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
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
      setFieldError('name', t('validation.networkError'));
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{ name: '' }}
      validationSchema={getValidationSchema(channels, t)}
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
              <Modal.Title>{t('modals.addChannel.title')}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <BootstrapForm.Group>
                <BootstrapForm.Label htmlFor="add-channel-name">
                  {t('modals.addChannel.label')}
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
                {t('modals.addChannel.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('modals.addChannel.submitting') : t('modals.addChannel.submit')}
              </Button>
            </Modal.Footer>
          </BootstrapForm>
        </Modal>
      )}
    </Formik>
  );
};

export default AddChannelModal;