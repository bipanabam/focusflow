import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Layout from './components/Layout'
import Home from './routes/Home'
import Register from './routes/Register';
import { Login } from './routes/Login';

function App() {

  return (
    <div className="min-w-full">
      <AuthProvider>
        <Routes>
          <Route path='/register' element={<Layout><Register /></Layout>} />
          <Route path='/login' element={<Layout><Login /></Layout>} />

          <Route path='/' element={<Layout>
            <ProtectedRoute><Home /></ProtectedRoute></Layout>} />
        </Routes>
      </AuthProvider>

    </div>
  )
}

export default App
