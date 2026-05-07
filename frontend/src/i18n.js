import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      app: {
        name: 'Hexlet Chat',
      },
      auth: {
        loginTitle: 'Log in',
        username: 'Your nickname',
        password: 'Password',
        submitLogin: 'Log in',
        submittingLogin: 'Logging in...',
        invalidCredentials: 'Username or password are incorrect',
        noAccount: "Don't have an account?",
        signupLink: 'Sign up',
        logout: 'Log out',
      },
      signup: {
        title: 'Sign up',
        username: 'Username',
        password: 'Password',
        confirmPassword: 'Confirm password',
        submit: 'Sign up',
        submitting: 'Signing up...',
        userExists: 'User already exists',
        networkError: 'Network error',
      },
      validation: {
        required: 'Required',
        usernameLength: 'Must be from 3 to 20 characters',
        passwordMin: 'Must be > 6 characters',
        passwordsMustMatch: 'Passwords must match',
        unique: 'Must be unique',
        networkError: 'Network error',
      },
      chat: {
        channels: 'Channels',
        addChannel: 'Add channel',
        selectChannel: 'Select channel {{name}}',
        channelControls: 'Controls for channel {{name}}',
        remove: 'Remove',
        rename: 'Rename',
        messagesCount_one: '{{count}} message',
        messagesCount_other: '{{count}} messages',
        noMessages: 'No messages yet.',
        loading: 'Loading...',
        loadError: 'Failed to load chat data. Try again later.',
      },
      messageForm: {
        newMessage: 'New message',
        placeholder: 'Enter message...',
        send: 'Send',
        sending: 'Sending...',
        sendError: 'Message was not sent. Check your connection.',
      },
      modals: {
        addChannel: {
          title: 'Add channel',
          label: 'Channel name',
          cancel: 'Cancel',
          submit: 'Create',
          submitting: 'Creating...',
        },
        removeChannel: {
          title: 'Remove channel',
          body: 'Are you sure you want to remove # {{name}}?',
          cancel: 'Cancel',
          submit: 'Remove',
          submitting: 'Removing...',
        },
        renameChannel: {
          title: 'Rename channel',
          label: 'Channel name',
          cancel: 'Cancel',
          submit: 'Save',
          submitting: 'Saving...',
        },
      },
      notFound: {
        title: '404',
        message: 'Page not found',
        link: 'Go to main page',
      },
      notifications: {
        dataLoadError: 'Failed to load chat data.',
        channelCreated: 'Channel created',
        channelRenamed: 'Channel renamed',
        channelRemoved: 'Channel removed',
      },
      errors: {
        unexpectedTitle: 'Something went wrong',
        unexpectedDescription: 'Please reload the page or try again later.',
      },
    },
  },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;