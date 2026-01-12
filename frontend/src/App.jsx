import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import { PomodoroSocketProvider } from './contexts/PomodoroSocketContext';

import Layout from './components/Layout'
import Home from './routes/Home'
import Register from './routes/Register';
import { Login } from './routes/Login';
import UserProfile from './routes/UserProfile';
import CreateTask from './routes/CreateTask';
import TaskPage from './routes/TaskPage';
import TaskDetail from './routes/TaskDetail';
import UserSettings from './routes/UserSettings';
import SettingsIndex from './pages/Settings/SettingsIndex';
import AccountSettings from './pages/Settings/AccountSettings';
import ChangePassword from './pages/Settings/ChangePassword';
import PomodoroSettings from './pages/Settings/PomodoroSettings';

function App() {

  return (
    <div className="min-w-full">
      <AuthProvider>
        <PomodoroSocketProvider>
          <Routes>
            <Route path='/register' element={<Layout><PublicRoute><Register /></PublicRoute></Layout>} />
            <Route path='/login' element={<Layout><PublicRoute><Login /></PublicRoute></Layout>} />

            <Route path='/' element={<Layout><ProtectedRoute><Home /></ProtectedRoute></Layout>} />
            <Route path='/profile' element={<Layout><UserProfile /></Layout>} />
            <Route path="/settings" element={<Layout><UserSettings /></Layout>}>
              <Route index element={<SettingsIndex />} />
              <Route path="account" element={<AccountSettings />} />
              <Route path="account/change-password" element={<ChangePassword />} />
              <Route path="pomodoro" element={<PomodoroSettings />} />
            </Route>
            <Route path='/tasks/create' element={<Layout><ProtectedRoute><CreateTask /></ProtectedRoute></Layout>} />
            <Route path='/tasks' element={<Layout><ProtectedRoute><TaskPage /></ProtectedRoute></Layout>} />
            <Route path='/tasks/:id' element={<Layout><ProtectedRoute><TaskDetail /></ProtectedRoute></Layout>} />
          </Routes>
        </PomodoroSocketProvider>
      </AuthProvider>

    </div>
  )
}

export default App
