import { createFileRoute } from '@tanstack/react-router';
import { AccountForm } from '@/components/AccountForm';

export const Route = createFileRoute('/signup')({
  head: () => ({ meta: [
    { title: 'Create an account — TripPilot' },
    { name: 'description', content: 'Create your TripPilot account for your next adventure.' },
    { property: 'og:title', content: 'Create an account — TripPilot' },
    { property: 'og:description', content: 'Start your next chapter with TripPilot.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary' },
  ] }),
  component: () => <AccountForm mode="signup" />,
});