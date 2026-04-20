import { useEffect, useState, type JSX } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api, storeSession, type AuthSessionResponse } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { toUserMessage } from "../lib/userErrors";

type CallbackAuthPayload = {
  accessToken: string | null;
  refreshToken: string | null;
  errorDescription: string | null;
  errorCode: string | null;
};

function getCallbackAuthPayload(): CallbackAuthPayload {
  const hashParams = new URLSearchParams(window.location.hash.startsWith("#") ? window.location.hash.slice(1) : "");
  const queryParams = new URLSearchParams(window.location.search);

  const readParam = (key: string): string | null => hashParams.get(key) ?? queryParams.get(key);

  return {
    accessToken: readParam("access_token"),
    refreshToken: readParam("refresh_token"),
    errorDescription: readParam("error_description"),
    errorCode: readParam("error"),
  };
}

function clearCallbackUrlArtifacts(): void {
  if (!window.location.hash && !window.location.search) {
    return;
  }

  window.history.replaceState({}, document.title, window.location.pathname);
}

export default function AuthCallback(): JSX.Element {
  const navigate = useNavigate();
  const { setUser, refreshProfile } = useAuth();
  const [message, setMessage] = useState("Verifying your account...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const finishAuth = async () => {
      try {
        const callbackPayload = getCallbackAuthPayload();

        if (callbackPayload.errorDescription || callbackPayload.errorCode) {
          throw new Error(
            callbackPayload.errorDescription ||
              "Email verification could not be completed. Please request a new verification email and try again.",
          );
        }

        if (callbackPayload.accessToken) {
          sessionStorage.setItem("access_token", callbackPayload.accessToken);
        }

        if (callbackPayload.refreshToken) {
          sessionStorage.setItem("refresh_token", callbackPayload.refreshToken);
        }

        clearCallbackUrlArtifacts();

        const me = (await api.me()) as AuthSessionResponse["user"];
        setUser(me);
        storeSession({
          access_token: callbackPayload.accessToken ?? sessionStorage.getItem("access_token"),
          refresh_token: callbackPayload.refreshToken ?? sessionStorage.getItem("refresh_token"),
          token_type: null,
          expires_in: null,
          user: me,
        });

        const profileState = await refreshProfile();
        const isComplete = profileState?.isOnboardingComplete ?? false;

        setMessage("Email verified. Redirecting...");
        navigate(isComplete ? "/intelligence" : "/onboarding", { replace: true });
      } catch (err) {
        setError(
          toUserMessage(
            err,
            "We couldn't verify your session from the email link. Please return to login and try again.",
          ),
        );
        setMessage("Email verification could not be completed.");
      }
    };

    void finishAuth();
  }, [navigate, refreshProfile, setUser]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface px-6">
      <div className="max-w-lg text-center">
        <p className="text-on-surface-variant">{message}</p>
        {error ? (
          <div className="mt-4 space-y-3">
            <p className="text-sm text-red-700">{error}</p>
            <Link
              to="/login"
              className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Back to login
            </Link>
          </div>
        ) : null}
      </div>
    </main>
  );
}
