import axios from 'axios';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../contexts/AuthContext';
import SignupPage from './SignupPage';

jest.mock('axios');

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        'signup.title': 'Sign up',
        'signup.username': 'Username',
        'signup.password': 'Password',
        'signup.confirmPassword': 'Confirm password',
        'signup.submit': 'Sign up',
        'signup.submitting': 'Signing up...',
        'signup.userExists': 'User already exists',
        'signup.networkError': 'Network error',
        'validation.required': 'Required',
        'validation.usernameLength': 'Must be from 3 to 20 characters',
        'validation.passwordMin': 'Must be > 6 characters',
        'validation.passwordsMustMatch': 'Passwords must match',
      };

      return translations[key] ?? key;
    },
  }),
}));

const renderSignupPage = () => {
  const logIn = jest.fn();
  const navigate = jest.fn();

  useAuth.mockReturnValue({ logIn });
  useNavigate.mockReturnValue(navigate);

  render(<SignupPage />);

  return {
    logIn,
    navigate,
  };
};

const fillSignupForm = ({
  username = 'felipe',
  password = '123456',
  confirmPassword = '123456',
} = {}) => {
  fireEvent.change(screen.getByLabelText('Username'), {
    target: { value: username },
  });

  fireEvent.change(screen.getByLabelText('Password'), {
    target: { value: password },
  });

  fireEvent.change(screen.getByLabelText('Confirm password'), {
    target: { value: confirmPassword },
  });
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SignupPage', () => {
  test('renders signup form', () => {
    renderSignupPage();

    expect(screen.getByRole('heading', { name: 'Sign up' })).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign up' })).toBeInTheDocument();
  });

  test('signs up user, trims username, logs in and redirects home', async () => {
    const authData = {
      token: 'token-123',
      username: 'felipe',
    };

    axios.post.mockResolvedValue({ data: authData });

    const { logIn, navigate } = renderSignupPage();

    fillSignupForm({
      username: '  felipe  ',
      password: '123456',
      confirmPassword: '123456',
    });

    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/v1/signup', {
        username: 'felipe',
        password: '123456',
      });
    });

    expect(logIn).toHaveBeenCalledWith(authData);
    expect(navigate).toHaveBeenCalledWith('/');
  });

  test('shows validation error when passwords do not match', async () => {
    renderSignupPage();

    fillSignupForm({
      username: 'felipe',
      password: '123456',
      confirmPassword: '654321',
    });

    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));

    expect(await screen.findByText('Passwords must match')).toBeInTheDocument();
    expect(axios.post).not.toHaveBeenCalled();
  });

  test('shows user exists error when server returns 409', async () => {
    axios.post.mockRejectedValue({
      response: {
        status: 409,
      },
    });

    const { logIn, navigate } = renderSignupPage();

    fillSignupForm();

    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));

    expect(await screen.findByText('User already exists')).toBeInTheDocument();
    expect(logIn).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  test('shows network error for non-409 failures', async () => {
    axios.post.mockRejectedValue(new Error('Network failed'));

    const { logIn, navigate } = renderSignupPage();

    fillSignupForm();

    fireEvent.click(screen.getByRole('button', { name: 'Sign up' }));

    expect(await screen.findByText('Network error')).toBeInTheDocument();
    expect(logIn).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
