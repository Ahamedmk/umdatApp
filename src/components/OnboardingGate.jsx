// /src/components/OnboardingGate.jsx
import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const ONBOARDING_KEY = "onboarding_done";

export function OnboardingGate({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;            // on attend que l'auth soit prête
    if (!user) return;              // pas connecté → pas d’onboarding

    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done && location.pathname !== "/onboarding") {
      navigate("/onboarding", { replace: true });
    }
  }, [user, loading, location.pathname, navigate]);

  return <>{children}</>;
}
