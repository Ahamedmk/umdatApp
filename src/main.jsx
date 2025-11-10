import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import AuthProvider from './context/AuthContext'
import ProgressProvider from './context/ProgressContext'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <AuthProvider>
    <ProgressProvider>
      <App />
    </ProgressProvider>
  </AuthProvider>
  </BrowserRouter>
)
