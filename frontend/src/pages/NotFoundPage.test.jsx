/* eslint-env jest */

import {
  render,
  screen,
} from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

import NotFoundPage from './NotFoundPage';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => {
      const translations = {
        'notFound.title': '404',
        'notFound.message': 'Page not found',
        'notFound.link': 'Back to home',
      };

      return translations[key] ?? key;
    },
  }),
}));

describe('NotFoundPage', () => {
  test('renders not found content and home button', () => {
    render(
      <MemoryRouter
        future={{
          v7_relativeSplatPath: true,
          v7_startTransition: true,
        }}
      >
        <NotFoundPage />
      </MemoryRouter>,
    );

    const homeButton = screen.getByRole('button', { name: 'Back to home' });

    expect(screen.getByRole('heading', { name: '404' })).toBeInTheDocument();
    expect(screen.getByText('Page not found')).toBeInTheDocument();
    expect(homeButton).toHaveAttribute('href', '/');
  });
});
