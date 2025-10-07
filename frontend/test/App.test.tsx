import { render, screen } from '@testing-library/react';

import App from '../src/App';

test('<App />', () => {
  render(<App />);
  expect(screen.getByText(/Personal Finance/i)).toBeInTheDocument();
});
