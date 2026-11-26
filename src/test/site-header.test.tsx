import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';

const { mockUseAccount } = vi.hoisted(() => ({
  mockUseAccount: vi.fn(),
}));

vi.mock('@tanstack/react-router', () => ({
  useNavigate: () => vi.fn(),
  Link: ({ children, to, ...rest }: { children: ReactNode; to: string; [key: string]: unknown }) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock('@/components/AuthProvider', () => ({
  useAccount: mockUseAccount,
}));

vi.mock('@/lib/auth', () => ({
  signOutMongo: vi.fn(),
}));

import { SiteHeader } from '@/components/SiteHeader';

describe('SiteHeader Sign in visibility', () => {
  it('shows the Sign in button immediately even while auth state is loading', () => {
    mockUseAccount.mockReturnValue({ user: null, loading: true, setUser: vi.fn(), refresh: vi.fn() });
    render(
      <QueryClientProvider client={new QueryClient()}>
        <SiteHeader />
      </QueryClientProvider>,
    );

    const signInLinks = screen.getAllByRole('link', { name: /sign in/i });
    expect(signInLinks.length).toBeGreaterThan(0);
    expect(signInLinks[0]).toHaveAttribute('href', '/auth');
  });

  it('shows the Sign in button when signed out', () => {
    mockUseAccount.mockReturnValue({ user: null, loading: false, setUser: vi.fn(), refresh: vi.fn() });
    render(
      <QueryClientProvider client={new QueryClient()}>
        <SiteHeader />
      </QueryClientProvider>,
    );

    const signInLinks = screen.getAllByRole('link', { name: /sign in/i });
    expect(signInLinks.length).toBeGreaterThan(0);
  });
});
