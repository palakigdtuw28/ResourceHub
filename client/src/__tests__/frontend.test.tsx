import { render, screen } from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';

describe('Frontend basic test', () => {
  it('renders a simple element', () => {
    render(<div>Hello Test</div>);
    expect(screen.getByText('Hello Test')).toBeInTheDocument();
  });
});