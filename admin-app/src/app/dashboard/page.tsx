import { getDictionary } from '@/lib/dictionaries';
import DashboardClientContent from '@/components/DashboardClientContent'; // Import the new client component

// Remove params type definition

// This is now a Server Component
export default async function DashboardPage() { // Remove params
  // Fetch the default (Polish) dictionary on the server
  const dictionary = await getDictionary();

  // Render the client component and pass only the dictionary as props
  return (
    <DashboardClientContent dictionary={dictionary} /> // Remove lang prop
  );
}
