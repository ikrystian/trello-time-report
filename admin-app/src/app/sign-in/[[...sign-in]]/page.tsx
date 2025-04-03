import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      {/* This catch-all route handles the sign-in process */}
      <SignIn path="/sign-in" signUpUrl="/sign-up" />
    </div>
  );
}
