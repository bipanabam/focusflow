import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <App />
    <Toaster
      position="top-center"
      reverseOrder={false}
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: "8px",
          fontSize: "14px",
        },
        className:
          "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-md",
      }}
    />
  </BrowserRouter>,
)
