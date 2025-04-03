import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="max-w-md text-center">
        {/* Placeholder for SVG - replace src when available */}
        {/* <Image
          src="/images/undraw_page_not_found_re_e9o6.svg"
          alt="Page Not Found Illustration"
          width={400}
          height={300}
          className="mb-8 mx-auto"
        /> */}
        <div className="w-[400px] h-[300px] bg-muted rounded-lg mb-8 mx-auto flex items-center justify-center text-muted-foreground">
          SVG Placeholder
        </div>

        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Oops! The page you are looking for does not exist or has been moved.
        </p>
        <Link href="/">
          <span className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            Go back home
          </span>
        </Link>
      </div>
    </div>
  );
}
