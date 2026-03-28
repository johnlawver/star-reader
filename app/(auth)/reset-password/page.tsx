export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="mb-4 text-3xl font-bold">Reset your password</h1>
      <p className="mb-8 text-gray-500">
        Password reset via email coming soon.
      </p>
      <a href="/login" className="text-blue-600">
        Back to sign in
      </a>
    </main>
  );
}
