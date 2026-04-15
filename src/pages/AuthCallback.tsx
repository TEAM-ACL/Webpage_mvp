import { useEffect, useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { api, type AuthSessionResponse } from "../lib/api";
import { useAuth } from "../context/AuthContext";

export default function AuthCallback(): JSX.Element {
  const navigate = useNavigate();
  const { setUser, refreshProfile } = useAuth();
  const [message, setMessage] = useState("Verifying your account...");

  useEffect(() => {
    const finishAuth = async () => {
      try {
        const me = (await api.me()) as AuthSessionResponse["user"];
        setUser(me);

        const profileState = await refreshProfile();
        const isComplete = profileState?.isOnboardingComplete ?? false;

        setMessage("Email verified. Redirecting...");
        navigate(isComplete ? "/intelligence" : "/onboarding", { replace: true });
      } catch {
        setMessage("Verification failed. Please log in again.");
      }
    };

    void finishAuth();
  }, [navigate, refreshProfile, setUser]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface px-6">
      <p className="text-on-surface-variant text-center">{message}</p>
    </main>
  );
}
