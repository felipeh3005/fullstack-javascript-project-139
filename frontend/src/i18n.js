import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      app: {
        name: 'Chat',
      },
      auth: {
        loginTitle: 'Log in',
        username: 'Username',
        password: 'Password',
        submitLogin: 'Log in',
        submittingLogin: 'Logging in...',
        invalidCredentials: 'Invalid username or password',
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
        networkError: 'Network error. Try again.',
      },
      validation: {
        required: 'Required',
        usernameLength: 'From 3 to 20 characters',
        passwordMin: 'At least 6 characters',
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