// /src/App.jsx
import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Navbar } from './components/Navbar'

// pages
import  Home  from './pages/Home'
import { Learn } from './pages/Learn'
import { Review } from './pages/Review'
import { Quiz } from './pages/Quiz'
import { Compare } from './pages/Compare'
import  Profile  from './pages/Profile'
import HadithDetail from './pages/HadithDetail'

export default function App() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/review" element={<Review />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/hadith" element={<HadithDetail />} />
          <Route path="/hadith/:n" element={<HadithDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
