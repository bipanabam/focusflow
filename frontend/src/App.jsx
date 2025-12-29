import { useState } from 'react'
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from './components/Layout'
import Home from './routes/Home'
import Register from './routes/Register';

function App() {

  return (
    <div className="min-w-full">
        <Routes>
          <Route path='/' element={<Layout><Home /></Layout>} />
          <Route path='/register' element={<Layout><Register /></Layout>} />
        </Routes>

    </div>
  )
}

export default App
