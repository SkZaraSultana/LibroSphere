import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/index.css'
import { Toaster } from 'react-hot-toast'
import { AppProvider } from './context/AppContext'
import { AuthProvider } from './context/AuthContext'

// Root entry for the React app. Wraps app with router and providers.
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <App />
          <Toaster />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
