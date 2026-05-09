/* eslint-env jest */

import { render, screen } from '@testing-library/react';
import {
  MemoryRouter,
  Route,
  Routes,
} from 'react-router-dom';

import PrivateRoute from './PrivateRoute';
import { useAuth } from '../contexts/AuthContext';

jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

const routerFutureConfig = {
  v7_relativeSplatPath: true,
  v7_startTransition: true,
};

const renderPrivateRoute = (loggedIn) => {
  useAuth.mockReturnValue({ loggedIn });

  return render(
    <MemoryRouter
      initialEntries={['/secret']}
      future={routerFutureConfig}
    >
      <Routes>
        <Route
          path="/secret"
          element={(
            <PrivateRoute>
              <div>Private content</div>
            </PrivateRoute>
          )}
        />
        <Route path="/login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>,
  );
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('PrivateRoute', () => {
  test('renders children when user is logged in', () => {
    renderPrivateRoute(true);

    expect(screen.getByText('Private content')).toBeTruthy();
    expect(screen.queryByText('Login page')).toBeNull();
  });

  test('redirects to login when user is not logged in', () => {
    renderPrivateRoute(false);

    expect(screen.getByText('Login page')).toBeTruthy();
    expect(screen.queryByText('Private content')).toBeNull();
  });
});
