import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';

const { signUpWithMongo, setUser, navigate } = vi.hoisted(() => ({
  signUpWithMongo: vi.fn(),
  setUser: vi.fn(),
  navigate: vi.fn(),
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => navigate,
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
}));
vi.mock('@/components/AuthProvider', () => ({
  useAccount: () => ({ user: null, loading: false, setUser, refresh: vi.fn() }),
}));
vi.mock('@/lib/auth', () => ({
  signInWithMongo: vi.fn(),
  signUpWithMongo,
  requestPasswordResetMongo: vi.fn(),
  resetPasswordMongo: vi.fn(),
}));

import { AccountForm } from '@/components/AccountForm';

describe('Account creation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('signs up with MongoDB auth and navigates home on success', async () => {
    const user = { id: 'user-1', email: 'traveler@example.com' };
    signUpWithMongo.mockResolvedValue({ user });
    render(<AccountForm mode="signup" />);

    fireEvent.change(screen.getByLabelText('Email address'), { target: { value: 'traveler@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'JourneyPass123' } });
    fireEvent.change(screen.getByLabelText('Confirm password'), { target: { value: 'JourneyPass123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() =>
      expect(signUpWithMongo).toHaveBeenCalledWith({
        data: { email: 'traveler@example.com', password: 'JourneyPass123' },
      }),
    );
    await waitFor(() => expect(setUser).toHaveBeenCalledWith(user));
    expect(navigate).toHaveBeenCalledWith({ to: '/' });
  });
});
