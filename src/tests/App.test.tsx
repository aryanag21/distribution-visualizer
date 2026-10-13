import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import App from '../App';

describe('DIST / LAB interface', () => {
  it('keeps normal standard deviation and variance synchronized', async () => {
    const user = userEvent.setup();
    render(<App />);
    const sigma = screen.getByLabelText('Standard deviation');
    await user.clear(sigma);
    await user.type(sigma, '2');
    await user.click(screen.getByRole('button', { name: 'Variance' }));
    expect(screen.getByLabelText('Variance')).toHaveValue(4);
  });

  it('preserves each distribution configuration when switching', async () => {
    const user = userEvent.setup();
    render(<App />);
    const mean = screen.getByLabelText('Mean');
    await user.clear(mean);
    await user.type(mean, '3');
    await user.click(screen.getByRole('radio', { name: "Student's t" }));
    const degrees = screen.getByLabelText('Degrees of freedom');
    await user.clear(degrees);
    await user.type(degrees, '12');
    await user.click(screen.getByRole('radio', { name: 'Normal' }));
    expect(screen.getByLabelText('Mean')).toHaveValue(3);
  });

  it('updates probability mode and supports keyboard graph interaction', async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('radio', { name: /Right tail/ }));
    expect(screen.getByText('P(X ≥ a) = 1 − F(a)')).toBeInTheDocument();
    const boundary = screen.getByRole('slider', { name: 'a boundary' });
    const before = Number(boundary.getAttribute('aria-valuenow'));
    fireEvent.keyDown(boundary, { key: 'ArrowRight' });
    expect(Number(screen.getByRole('slider', { name: 'a boundary' }).getAttribute('aria-valuenow'))).toBeGreaterThan(before);
  });

  it('calculates probabilities independently from viewport zoom', async () => {
    const user = userEvent.setup();
    render(<App />);
    const before = screen.getAllByText('0.682689')[0];
    await user.click(screen.getByRole('button', { name: 'Zoom in' }));
    expect(before).toBeInTheDocument();
    expect(screen.getAllByText('0.682689')).toHaveLength(2);
  });
});
