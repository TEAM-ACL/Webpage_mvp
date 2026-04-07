import { Link } from "react-router-dom";

export default function ForgotPassword(): JSX.Element {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-surface px-6">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 border border-surface-container-high">
        <h1 className="text-2xl font-headline font-bold text-on-surface mb-3">Reset your password</h1>
        <p className="text-on-surface-variant mb-6">
          Password resets are handled by support right now. Please contact us and include your account email.
        </p>
        <a
          href="mailto:support@visiontech.ai?subject=Password%20Reset"
          className="w-full inline-flex justify-center items-center py-3 px-4 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition"
        >
          Email support@visiontech.ai
        </a>
        <div className="mt-6 text-sm text-on-surface-variant text-center">
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </main>
  );
}
