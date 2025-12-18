import { redirect } from 'next/navigation';
import { routing } from '@/i18n/routing';

// This page only renders when the user is on `/`
// The middleware will redirect to the appropriate locale
export default function RootPage() {
  redirect(`/${routing.defaultLocale}`);
}
