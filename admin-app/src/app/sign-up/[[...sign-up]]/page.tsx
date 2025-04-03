import { SignUp } from "@clerk/nextjs";
import Link from "next/link";

export default function SignUpPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-primary text-primary-foreground p-4 shadow-md">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Trello Time Report Admin</h1>
          <Link href="/" className="hover:underline">
            Back to Landing Page
          </Link>
        </div>
      </header>
      <main className="flex flex-grow justify-center items-center">
        {/* This catch-all route handles the sign-up process */}
        <SignUp path="/sign-up" signInUrl="/sign-in" />
      </main>
    </div>
  );
}
