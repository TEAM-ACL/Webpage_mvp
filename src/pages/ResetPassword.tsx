import { useState } from "react";
import type { JSX } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { api } from "../lib/api";
import { useToast } from "../context/ToastContext";
import { toUserMessage } from "../lib/userErrors";

export default function ResetPassword(): JSX.Element {
  const { showError, showSuccess } = useToast();
  const [params] = useSearchParams();
  const token = params.get("token") || params.get("access_token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      const message = "Passwords do not match.";
      setError(message);
      showError(message);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.confirmPasswordReset(password, token);
      setDone(true);
      showSuccess("Your password has been updated.");
    } catch (err) {
      const message = toUserMessage(err, "Unable to reset password right now.");
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-surface px-6">
      <div className="max-w-md w-full bg-white shadow-xl rounded-2xl p-8 border border-surface-container-high">
        <h1 className="text-2xl font-headline font-bold text-on-surface mb-3">Set a new password</h1>
        {done ? (
          <div className="space-y-4">
            <p className="text-on-surface-variant">Your password has been updated.</p>
            <Link to="/login" className="text-primary font-semibold hover:underline">Return to login</Link>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            <input
              type="password"
              minLength={8}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-surface-container-high rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/30"
              placeholder="New password"
            />
            <input
              type="password"
              minLength={8}
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full border border-surface-container-high rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/30"
              placeholder="Confirm password"
            />
            {error && (
              <p className="text-sm text-red-600">
                We couldn't update your password. Please check the notification and try again.
              </p>
            )}
            <button
              type="submit"
              disabled={loading || !token}
              className="w-full inline-flex justify-center items-center py-3 px-4 bg-primary text-white rounded-xl font-semibold hover:opacity-90 transition disabled:opacity-60"
            >
              {loading ? "Updating..." : "Update password"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
