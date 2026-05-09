/* eslint-env jest */
import axios from 'axios';
import {
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useAuth } from '../contexts/AuthContext';
import LoginPage from './LoginPage';

const mockNavigate = jest.fn();

jest.mock('axios');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        'auth.loginTitle': 'Log in',
        'auth.username': 'Your nickname',
        'auth.password': 'Password',
        'auth.submitLogin': 'Log in',
        'auth.submittingLogin': 'Logging in...',
        'auth.invalidCredentials': 'Username or password are incorrect',
        'auth.signupLink': 'Sign up',
        'validation.required': 'Required',
      };

      return translations[key] ?? key;
    },
  }),
}));

jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const renderLoginPage = () => render(<LoginPage />);

describe('LoginPage', () => {
  const logIn = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    useAuth.mockReturnValue({ logIn });
  });

  test('renders login form and signup link', () => {
    renderLoginPage();

    expect(screen.getByRole('heading', { name: 'Log in' })).toBeInTheDocument();
    expect(screen.getByLabelText('Your nickname')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Log in' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign up' })).toHaveAttribute(
      'href',
      '/signup',
    );
  });

  test('shows validation errors when submitting empty credentials', async () => {
    renderLoginPage();

    userEvent.click(screen.getByRole('button', { name: 'Log in' }));

    await waitFor(() => {
      expect(screen.getAllByText('Required')).toHaveLength(2);
    });

    expect(axios.post).not.toHaveBeenCalled();
  });

  test('logs in and redirects to the main page with valid credentials', async () => {
    const authData = {
      token: 'token-123',
      username: 'felipe',
    };

    axios.post.mockResolvedValue({ data: authData });

    renderLoginPage();

    userEvent.type(screen.getByLabelText('Your nickname'), 'felipe');
    userEvent.type(screen.getByLabelText('Password'), 'secret');
    userEvent.click(screen.getByRole('button', { name: 'Log in' }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith('/api/v1/login', {
        username: 'felipe',
        password: 'secret',
      });
    });

    expect(logIn).toHaveBeenCalledWith(authData);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('shows an error when credentials are invalid', async () => {
    axios.post.mockRejectedValue(new Error('Invalid credentials'));

    renderLoginPage();

    userEvent.type(screen.getByLabelText('Your nickname'), 'felipe');
    userEvent.type(screen.getByLabelText('Password'), 'wrong-password');
    userEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(
      await screen.findByText('Username or password are incorrect'),
    ).toBeInTheDocument();

    expect(logIn).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Log in' })).toBeEnabled();
  });
});
