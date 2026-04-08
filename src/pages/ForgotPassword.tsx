import { useState } from "react";
import type { JSX } from "react";
import { Link } from "react-router-dom";
import { api } from "../lib/api";

export default function ForgotPassword(): JSX.Element {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api.requestPasswordReset(email, window.location.origin + "/reset-password");
      setSent(true);
    } catch (err) {
      setError((err as Error).message || "Unable to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-surface px-6">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 border border-surface-container-high">
        <h1 className="text-2xl font-headline font-bold text-on-surface mb-3">Reset your password</h1>
        <p className="text-on-surface-variant mb-6">
          Enter your account email and we’ll send a reset link.
        </p>
        {sent ? (
          <div className="bg-green-50 border border-green-100 text-green-700 rounded-xl px-4 py-3 mb-4">
            If an account exists for that email, a reset link is on its way.
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-surface-container-high rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/30"
              placeholder="you@example.com"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex justify-center items-center py-3 px-4 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>
        )}
        <div className="mt-6 text-sm text-on-surface-variant text-center">
          <Link to="/login" className="text-primary font-semibold hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </main>
  );
}
