import axios from 'axios';
import { Formik } from 'formik';
import {
  Button,
  Form as BootstrapForm,
  Modal,
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import * as yup from 'yup';

import { useAuth } from '../../contexts/AuthContext';
import {
  renameChannel,
  selectChannels,
} from '../../slices/chatSlice';
import cleanProfanity from '../../utils/profanityFilter';

const getValidationSchema = (channels, currentChannel, t) => {
  const channelNames = channels
    .filter(({ id }) => String(id) !== String(currentChannel.id))
    .map(({ name }) => cleanProfanity(name).toLowerCase());

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

        const cleanedName = cleanProfanity(value.trim()).toLowerCase();

        return !channelNames.includes(cleanedName);
      }),
  });
};

const RenameChannelModal = ({ show, channel, onHide }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const channels = useSelector(selectChannels) ?? [];
  const { user } = useAuth();

  if (!show || !channel) {
    return null;
  }

  const handleSubmit = async (values, { setFieldError, setSubmitting }) => {
    const name = cleanProfanity(values.name.trim());

    try {
      const response = await axios.patch(
        `/api/v1/channels/${channel.id}`,
        { name },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        },
      );

      dispatch(renameChannel(response.data ?? { ...channel, name }));
      toast.success(t('notifications.channelRenamed'));
      onHide();
    } catch {
      setFieldError('name', t('validation.networkError'));
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{ name: channel.name }}
      validationSchema={getValidationSchema(channels, channel, t)}
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
              <Modal.Title>{t('modals.renameChannel.title')}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <BootstrapForm.Group>
                <BootstrapForm.Label htmlFor="rename-channel-name">
                  {t('modals.renameChannel.label')}
                </BootstrapForm.Label>
                <BootstrapForm.Control
                  id="rename-channel-name"
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
                {t('modals.renameChannel.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? t('modals.renameChannel.submitting')
                  : t('modals.renameChannel.submit')}
              </Button>
            </Modal.Footer>
          </BootstrapForm>
        </Modal>
      )}
    </Formik>
  );
};

export default RenameChannelModal;
