import { Redirect } from 'expo-router';

export default function Index() {
  // Always redirect to the login page first as requested
  return <Redirect href="/login" />;
}
