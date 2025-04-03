import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex justify-center items-center min-h-screen">
      {/* This catch-all route handles the sign-up process */}
      <SignUp path="/sign-up" signInUrl="/sign-in" />
    </div>
  );
}
