import { createFileRoute } from '@tanstack/react-router';
import { AccountForm } from '@/components/AccountForm';

export const Route = createFileRoute('/forgot-password')({
  head: () => ({ meta: [
    { title: 'Forgot password — TripPilot' },
    { name: 'description', content: 'Request a secure password reset link for your TripPilot account.' },
    { property: 'og:title', content: 'Forgot password — TripPilot' },
    { property: 'og:description', content: 'Recover access to your TripPilot account.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: () => <AccountForm mode="forgot" />,
});