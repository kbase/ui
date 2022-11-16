import React from 'react';
import { render, screen } from '@testing-library/react';
import { PlaceholderFactory } from './PlaceholderFactory';

const TestElement = PlaceholderFactory('TestElement');

test('renders a Placeholder', () => {
  render(<TestElement with={'some props'} />);
  const output = screen.getByText(/TestElement/);
  expect(output).toBeInTheDocument();
});
