import { useState, useEffect, type FormEvent } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { ArrowRight, Compass, Eye, EyeOff, LoaderCircle, Mail, CheckCircle2 } from 'lucide-react';
import {
  signInWithMongo,
  signUpWithMongo,
  requestPasswordResetMongo,
  resetPasswordMongo,
  getGoogleOAuthUrl,
} from '@/lib/auth';
import { useAccount } from '@/components/AuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type Mode = 'signin' | 'signup' | 'forgot' | 'reset';
const titles: Record<Mode, string> = {
  signin: 'Welcome back.',
  signup: 'Your next chapter starts here.',
  forgot: 'Forgot your password?',
  reset: 'A fresh start.',
};
const descriptions: Record<Mode, string> = {
  signin: 'Sign in to your TripPilot account.',
  signup: 'Create your TripPilot account.',
  forgot: 'We’ll generate a password reset link for your account.',
  reset: 'Choose a new password for your account.',
};

export function AccountForm({ mode }: { mode: Mode }) {
  const navigate = useNavigate();
  const { setUser } = useAccount();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [visible, setVisible] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resetToken, setResetToken] = useState<string | null>(null);

  useEffect(() => {
    if (mode !== 'reset') return;
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) {
      setError('Open the password reset link to continue.');
      return;
    }
    setResetToken(token);
  }, [mode]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setSuccess('');
    if ((mode === 'signup' || mode === 'reset') && password !== confirm) {
      setError('Your passwords don’t match.');
      return;
    }
    if (mode === 'reset' && !resetToken) return;

    setBusy(true);
    try {
      if (mode === 'signin') {
        const { user } = await signInWithMongo({ data: { email: email.trim(), password } });
        setUser(user);
        await navigate({ to: '/' });
      } else if (mode === 'signup') {
        const { user } = await signUpWithMongo({ data: { email: email.trim(), password } });
        setUser(user);
        await navigate({ to: '/' });
      } else if (mode === 'forgot') {
        const res = await requestPasswordResetMongo({ data: { email: email.trim() } });
        if (res.resetToken) {
          setResetToken(res.resetToken);
        }
        setSuccess('If an account exists for this email, your password reset link is ready.');
      } else if (resetToken) {
        await resetPasswordMongo({ data: { token: resetToken, password } });
        setSuccess('Your password has been updated.');
      }
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  async function continueWithGoogle() {
    setBusy(true);
    setError('');
    try {
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const { url } = await getGoogleOAuthUrl({ data: { redirectUri } });
      window.location.href = url;
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Google sign-in failed.');
      setBusy(false);
    }
  }

  const accountMode = mode === 'signin' || mode === 'signup';
  return (
    <main className="mx-auto w-full max-w-md px-6 py-12 sm:py-16">
      <div className="neu-raised rounded-3xl p-8">
        <div className="mb-6 flex items-center gap-2 text-primary">
          <Compass className="size-5" />
          <span className="font-mono text-xs font-semibold uppercase tracking-wider">TripPilot · Your account</span>
        </div>
        <h1 className="font-display text-3xl font-bold leading-tight text-foreground">{titles[mode]}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{descriptions[mode]}</p>

      {success ? (
        <div className="mt-8 space-y-5" role="status">
          <CheckCircle2 className="size-9 text-primary" />
          <p>{success}</p>
          {mode === 'forgot' && resetToken ? (
            <Button asChild className="w-full">
              <a href={`/reset-password?token=${encodeURIComponent(resetToken)}`}>
                Reset password now
                <ArrowRight />
              </a>
            </Button>
          ) : (
            <Button asChild className="w-full">
              <Link to={mode === 'reset' ? '/auth' : '/'}>
                {mode === 'reset' ? 'Sign in' : 'Plan a trip'}
                <ArrowRight />
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <>
          {accountMode && (
            <div className="mt-8 space-y-3">
              <Button
                type="button"
                variant="outline"
                className="google-signin h-11 w-full gap-2.5"
                disabled={busy}
                onClick={() => void continueWithGoogle()}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="size-[18px]">
                  <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z" />
                  <path fill="#FBBC05" d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
                </svg>
                Continue with Google
              </Button>
              <div className="flex items-center gap-4 py-2">
                <span className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted-foreground">or with email</span>
                <span className="h-px flex-1 bg-border" />
              </div>
            </div>
          )}
          <form onSubmit={submit} className="mt-6 space-y-5">
          {mode !== 'reset' && (
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-card"
              />
            </div>
          )}

          {mode !== 'forgot' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{mode === 'reset' ? 'New password' : 'Password'}</Label>
                {mode === 'signin' && (
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                )}
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={visible ? 'text' : 'password'}
                  autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                  required
                  minLength={mode === 'signin' ? 1 : 8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 bg-card pr-12"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1"
                  aria-label={visible ? 'Hide password' : 'Show password'}
                  title={visible ? 'Hide password' : 'Show password'}
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? <EyeOff /> : <Eye />}
                </Button>
              </div>
              {mode !== 'signin' && <p className="text-xs text-muted-foreground">At least 8 characters.</p>}
            </div>
          )}

          {(mode === 'signup' || mode === 'reset') && (
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <Input
                id="confirm"
                type={visible ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={8}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="h-11 bg-card"
              />
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" className="h-11 w-full" disabled={busy || (mode === 'reset' && !resetToken)}>
            {busy ? <LoaderCircle className="animate-spin" /> : mode === 'forgot' ? <Mail /> : null}
            {mode === 'signin'
              ? 'Sign in'
              : mode === 'signup'
                ? 'Create account'
                : mode === 'forgot'
                  ? 'Generate reset link'
                  : 'Update password'}
            {!busy && mode !== 'forgot' && <ArrowRight />}
          </Button>
        </form>
        </>
      )}

      {accountMode && (
        <p className="mt-7 text-center text-sm text-muted-foreground">
          {mode === 'signin' ? 'New to TripPilot? ' : 'Already have an account? '}
          <Link to={mode === 'signin' ? '/signup' : '/auth'} className="font-medium text-primary hover:underline">
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </Link>
        </p>
      )}
      {!accountMode && (
        <Link
          to={mode === 'reset' ? '/forgot-password' : '/auth'}
          className="mt-7 block text-center text-sm text-primary hover:underline"
        >
          {mode === 'reset' ? 'Request a new reset link' : 'Back to sign in'}
        </Link>
      )}
      </div>
    </main>
  );
}
