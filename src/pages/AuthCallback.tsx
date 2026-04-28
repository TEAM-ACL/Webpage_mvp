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
  verificationType: string | null;
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
    verificationType: readParam("type"),
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
  const [showLoginAction, setShowLoginAction] = useState(false);

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

        if (callbackPayload.verificationType === "recovery") {
          clearCallbackUrlArtifacts();
          if (!callbackPayload.accessToken) {
            throw new Error("This password reset link is invalid or has expired. Please request a new one.");
          }
          navigate("/reset-password", { replace: true });
          return;
        }

        clearCallbackUrlArtifacts();

        if (!callbackPayload.accessToken && !callbackPayload.refreshToken) {
          const successMessage =
            callbackPayload.verificationType === "signup"
              ? "Your email has been verified successfully. Please log in to continue."
              : "Verification complete. Please log in to continue.";
          setMessage(successMessage);
          setShowLoginAction(true);
          return;
        }

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

        setMessage("You have been verified. Redirecting to your workspace...");
        navigate(isComplete ? "/intelligence" : "/onboarding", { replace: true });
      } catch (err) {
        setError(
          toUserMessage(
            err,
            "We couldn't verify your session from the email link. Please return to login and try again.",
          ),
        );
        setMessage("Email verification could not be completed.");
        setShowLoginAction(true);
      }
    };

    void finishAuth();
  }, [navigate, refreshProfile, setUser]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-base font-semibold text-slate-900">{message}</p>
        {error ? <p className="mt-3 text-sm text-red-700">{error}</p> : null}
        {showLoginAction ? (
          <div className="mt-5">
            <Link
              to="/login"
              state={{ verificationMessage: "Your email has been verified. You can now log in." }}
              className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Login now
            </Link>
          </div>
        ) : null}
      </div>
    </main>
  );
}
