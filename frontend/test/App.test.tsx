import { render, screen } from '@testing-library/react';

import App from '../src/App';

test('<App /> renders login page', () => {
  render(<App />);
  // App should render the login page by default (not authenticated)
  expect(screen.getByText(/Вхід/i)).toBeInTheDocument();
  expect(screen.getByPlaceholderText(/your@email.com/i)).toBeInTheDocument();
});
