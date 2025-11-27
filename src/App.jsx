// /src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { OnboardingGate } from "./components/OnboardingGate";
import { Home } from "./pages/Home";
import { Learn } from "./pages/Learn";
import { Review } from "./pages/Review";
import { Quiz } from "./pages/Quiz";
import NarratorsCollection from "./pages/NarratorsCollection";
import { Compare } from "./pages/Compare";
import SiraTimeline from "./pages/SiraTimeline";
import { Profile } from "./pages/Profile";
import HadithDetail from "./pages/HadithDetail";
import ProfileGuest from "./pages/ProfileGuest";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Onboarding from "./pages/Onboarding";
import ExamQuiz from "./pages/ExamQuiz";
import ExamQuizTargeted from "./pages/ExamQuizTargeted";

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto">
        <Routes>
          {/* 🔐 Page d’inscription / connexion SANS onboarding */}
          <Route path="/profile" element={<ProfileGuest />} />

          {/* 🔐 Onboarding : nécessite d’être connecté, mais pas gated par OnboardingGate */}
          <Route
            path="/onboarding"
            element={
              <ProtectedRoute>
                <Onboarding />
              </ProtectedRoute>
            }
          />

          {/* 🔐 Toutes les pages app → protégées + passent par OnboardingGate */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <OnboardingGate>
                  <Home />
                </OnboardingGate>
              </ProtectedRoute>
            }
          />

          <Route
            path="/learn"
            element={
              <ProtectedRoute>
                <OnboardingGate>
                  <Learn />
                </OnboardingGate>
              </ProtectedRoute>
            }
          />

          <Route path="/timeline"
          element={
            <ProtectedRoute>
                <OnboardingGate>
          <SiraTimeline />
          </OnboardingGate>
              </ProtectedRoute>
            } 
            />

          <Route
            path="/review"
            element={
              <ProtectedRoute>
                <OnboardingGate>
                  <Review />
                </OnboardingGate>
              </ProtectedRoute>
            }
          />

          <Route
            path="/quiz"
            element={
              <ProtectedRoute>
                <OnboardingGate>
                  <Quiz />
                </OnboardingGate>
              </ProtectedRoute>
            }
          />

          <Route
            path="/compare"
            element={
              <ProtectedRoute>
                <OnboardingGate>
                  <Compare />
                </OnboardingGate>
              </ProtectedRoute>
            }
          />

          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <OnboardingGate>
                  <Profile />
                </OnboardingGate>
              </ProtectedRoute>
            }
          />

          <Route
            path="/hadith"
            element={
              <ProtectedRoute>
                <OnboardingGate>
                  <HadithDetail />
                </OnboardingGate>
              </ProtectedRoute>
            }
          />

          <Route
            path="/hadith/:n"
            element={
              <ProtectedRoute>
                <OnboardingGate>
                  <HadithDetail />
                </OnboardingGate>
              </ProtectedRoute>
            }
          />

          <Route
            path="/exam"
            element={
              <ProtectedRoute>
                <OnboardingGate>
                  <ExamQuiz />
                </OnboardingGate>
              </ProtectedRoute>
            }
          />

          <Route
            path="/exam/targeted"
            element={
              <ProtectedRoute>
                <OnboardingGate>
                  <ExamQuizTargeted />
                </OnboardingGate>
              </ProtectedRoute>
            }
          />
          <Route
  path="/narrators"
  element={
    <ProtectedRoute>
      <NarratorsCollection />
    </ProtectedRoute>
  }
/>
          {/* 🔁 Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
