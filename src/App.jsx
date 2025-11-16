// /src/App.jsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Navbar } from './components/Navbar'

import { Home } from './pages/Home'
import { Learn } from './pages/Learn'
import { Review } from './pages/Review'
import { Quiz } from './pages/Quiz'
import { Compare } from './pages/Compare'
import { Profile } from './pages/Profile'
import HadithDetail from './pages/HadithDetail'
import ProfileGuest from "./pages/ProfileGuest"; // écran email
import { ProtectedRoute } from "./components/ProtectedRoute";

// ⬇️ nouvelles pages
import ExamQuiz from './pages/ExamQuiz'
import ExamQuizTargeted from './pages/ExamQuizTargeted'

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto">
        <Routes>
          <Route path="/profile" element={<ProfileGuest />} />
          <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
         <Route
          path="/learn"
          element={
            <ProtectedRoute>
              <Learn />
            </ProtectedRoute>
          }
        />
        <Route
          path="/review"
          element={
            <ProtectedRoute>
              <Review />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz"
          element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/compare"
          element={
            <ProtectedRoute>
              <Compare />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        /> 
          <Route path="/hadith"
           element={
            <ProtectedRoute>
           <HadithDetail />
           </ProtectedRoute>
          } 
          />
           <Route path="/hadith/:n"
           element={
            <ProtectedRoute>
           <HadithDetail />
           </ProtectedRoute>
          } 
          />
          {/* ⬇️ examens */}
          <Route path="/exam"
           element={
            <ProtectedRoute>
           <ExamQuiz />
           </ProtectedRoute>
          } 
          />
          <Route path="/exam/targeted"
           element={
            <ProtectedRoute>
           <ExamQuizTargeted />
           </ProtectedRoute>
          } 
          />
          <Route path="*"
           element={
            <ProtectedRoute>
           <Navigate to="/" replace  />
           </ProtectedRoute>
          } 
          />

        </Routes>
      </main>
    </div>
  )
}
