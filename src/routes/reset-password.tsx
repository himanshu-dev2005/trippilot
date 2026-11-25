import { createFileRoute } from '@tanstack/react-router';
import { AccountForm } from '@/components/AccountForm';

export const Route = createFileRoute('/reset-password')({
  head: () => ({ meta: [
    { title: 'Reset password — TripPilot' },
    { name: 'description', content: 'Set a new password using your secure TripPilot recovery link.' },
    { property: 'og:title', content: 'Reset password — TripPilot' },
    { property: 'og:description', content: 'Choose a new password for TripPilot.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: () => <AccountForm mode="reset" />,
});