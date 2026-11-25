import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import { exchangeGoogleCodeMongo } from '@/lib/auth.server';
import { useAccount } from '@/components/AuthProvider';

export const Route = createFileRoute('/auth/google/callback')({
  component: GoogleCallback,
});

function GoogleCallback() {
  const navigate = useNavigate();
  const { setUser } = useAccount();
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const oauthError = params.get('error');

    if (oauthError) {
      setError(`Google sign-in was cancelled (${oauthError}).`);
      return;
    }
    if (!code) {
      setError('Missing authorization code from Google.');
      return;
    }

    const redirectUri = `${window.location.origin}/auth/google/callback`;
    void exchangeGoogleCodeMongo({ data: { code, redirectUri } })
      .then(({ user }) => {
        setUser(user);
        return navigate({ to: '/', replace: true });
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Google sign-in failed.');
      });
  }, [navigate, setUser]);

  return (
    <main className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-6 text-center">
      {error ? (
        <div role="alert" className="space-y-4">
          <p className="text-sm text-destructive">{error}</p>
          <a href="/auth" className="text-sm font-medium text-primary hover:underline">
            Back to sign in
          </a>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <LoaderCircle className="size-6 animate-spin text-primary" />
          <p className="text-sm">Completing Google sign-in...</p>
        </div>
      )}
    </main>
  );
}
