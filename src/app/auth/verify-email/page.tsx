import { redirect } from "next/navigation";

import { useEmailVerificationToken } from "@/lib/tokens";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token;

  if (!token) {
    redirect("/auth/login");
  }

  const record = await useEmailVerificationToken(token);

  const success = !!record;

  return (
    <div className="space-y-4 text-sm text-zinc-200">
      <h2 className="text-base font-semibold tracking-tight text-zinc-50">
        Email verification
      </h2>
      {success ? (
        <p>
          Your email has been verified successfully. You can now sign in to your
          account.
        </p>
      ) : (
        <p>
          This verification link is invalid or has expired. If you still can&apos;t
          sign in, try requesting a new one by creating an account again.
        </p>
      )}
      <p>
        <a
          href="/auth/login"
          className="font-medium text-zinc-100 underline-offset-4 hover:underline"
        >
          Continue to login
        </a>
      </p>
    </div>
  );
}

