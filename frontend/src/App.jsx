import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

import Layout from './components/Layout'
import Home from './routes/Home'
import Register from './routes/Register';
import { Login } from './routes/Login';
import CreateTask from './routes/CreateTask';
import TaskPage from './routes/TaskPage';
import TaskDetail from './routes/TaskDetail';

function App() {

  return (
    <div className="min-w-full">
      <AuthProvider>
        <Routes>
          <Route path='/register' element={<Layout><PublicRoute><Register /></PublicRoute></Layout>} />
          <Route path='/login' element={<Layout><PublicRoute><Login /></PublicRoute></Layout>} />

          <Route path='/' element={<Layout><ProtectedRoute><Home /></ProtectedRoute></Layout>} />
          <Route path='/tasks/create' element={<Layout><ProtectedRoute><CreateTask /></ProtectedRoute></Layout>} />
          <Route path='/tasks' element={<Layout><ProtectedRoute><TaskPage /></ProtectedRoute></Layout>} />
          <Route path='/tasks/:id' element={<Layout><ProtectedRoute><TaskDetail /></ProtectedRoute></Layout>} />
        </Routes>
      </AuthProvider>

    </div>
  )
}

export default App
