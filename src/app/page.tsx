import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <main className="w-full max-w-md space-y-8 text-center">
        <h1 className="animate-fade-up delay-0 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Client Portal
        </h1>
        <p className="animate-fade-up delay-100 text-zinc-600 dark:text-zinc-400">
          Sign in to manage your projects, messages, and subscription.
        </p>
        <div className="animate-fade-up delay-200 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/auth/login"
            className="rounded-lg bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Log in
          </Link>
          <Link
            href="/auth/signup"
            className="rounded-lg border border-zinc-300 px-6 py-3 text-sm font-medium text-zinc-900 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
          >
            Sign up
          </Link>
        </div>
      </main>
    </div>
  );
}
