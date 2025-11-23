// src/components/OnboardingGate.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const ONBOARDING_KEY = "onboarding_done_umdatu"; // nom de clé unique

export function OnboardingGate({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // on lit la clé en localStorage
    const done = localStorage.getItem(ONBOARDING_KEY) === "1";

    // si l'onboarding n'est PAS fait et qu'on n'est pas déjà sur /onboarding → redirection
    if (!done && location.pathname !== "/onboarding") {
      navigate("/onboarding", { replace: true });
      return;
    }

    // sinon on laisse l’app s’afficher normalement
    setReady(true);
  }, [location.pathname, navigate]);

  // Cas spécial : si on est sur /onboarding, on affiche toujours l’onboarding
  if (location.pathname === "/onboarding") {
    return children;
  }

  // pendant la redirection on peut ne rien rendre (ou un loader si tu veux)
  if (!ready) {
    return null;
  }

  return children;
}

export { ONBOARDING_KEY };
