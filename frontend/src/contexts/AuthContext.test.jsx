/* eslint-env jest */

import {
  fireEvent,
  render,
  screen,
} from '@testing-library/react';

import {
  AuthProvider,
  useAuth,
} from './AuthContext';

const AuthConsumer = () => {
  const {
    user,
    loggedIn,
    logIn,
    logOut,
  } = useAuth();

  return (
    <div>
      <span data-testid="username">
        {user?.username ?? 'anonymous'}
      </span>
      <span data-testid="logged-in">
        {String(loggedIn)}
      </span>
      <button
        type="button"
        onClick={() => logIn({
          username: 'felipe',
          token: 'token-123',
        })}
      >
        Log in
      </button>
      <button type="button" onClick={logOut}>
        Log out
      </button>
    </div>
  );
};

const renderAuthProvider = () => render(
  <AuthProvider>
    <AuthConsumer />
  </AuthProvider>,
);

beforeEach(() => {
  localStorage.clear();
});

describe('AuthContext', () => {
  test('starts with anonymous user when local storage is empty', () => {
    renderAuthProvider();

    expect(screen.getByTestId('username')).toHaveTextContent('anonymous');
    expect(screen.getByTestId('logged-in')).toHaveTextContent('false');
  });

  test('logs user in and stores user data in local storage', () => {
    renderAuthProvider();

    fireEvent.click(screen.getByRole('button', { name: 'Log in' }));

    expect(screen.getByTestId('username')).toHaveTextContent('felipe');
    expect(screen.getByTestId('logged-in')).toHaveTextContent('true');
    expect(localStorage.getItem('user')).toBe(JSON.stringify({
      username: 'felipe',
      token: 'token-123',
    }));
  });

  test('loads existing user from local storage', () => {
    localStorage.setItem('user', JSON.stringify({
      username: 'stored-user',
      token: 'stored-token',
    }));

    renderAuthProvider();

    expect(screen.getByTestId('username')).toHaveTextContent('stored-user');
    expect(screen.getByTestId('logged-in')).toHaveTextContent('true');
  });

  test('logs user out and removes user data from local storage', () => {
    localStorage.setItem('user', JSON.stringify({
      username: 'stored-user',
      token: 'stored-token',
    }));

    renderAuthProvider();

    fireEvent.click(screen.getByRole('button', { name: 'Log out' }));

    expect(screen.getByTestId('username')).toHaveTextContent('anonymous');
    expect(screen.getByTestId('logged-in')).toHaveTextContent('false');
    expect(localStorage.getItem('user')).toBeNull();
  });

  test('removes corrupted user data from local storage', () => {
    localStorage.setItem('user', '{broken-json');

    renderAuthProvider();

    expect(screen.getByTestId('username')).toHaveTextContent('anonymous');
    expect(screen.getByTestId('logged-in')).toHaveTextContent('false');
    expect(localStorage.getItem('user')).toBeNull();
  });
});
