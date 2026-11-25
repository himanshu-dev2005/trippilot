import { createFileRoute } from '@tanstack/react-router';
import { AccountForm } from '@/components/AccountForm';

export const Route = createFileRoute('/auth')({
  head: () => ({ meta: [
    { title: 'Sign in — TripPilot' },
    { name: 'description', content: 'Sign in to your TripPilot travel account.' },
    { property: 'og:title', content: 'Sign in — TripPilot' },
    { property: 'og:description', content: 'Welcome back to your TripPilot account.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: () => <AccountForm mode="signin" />,
});