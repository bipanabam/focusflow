import { useState } from 'react'
import './App.css'

import Layout from './components/Layout'
import Home from './routes/Home'

function App() {

  return (
    <div className="min-w-full">
      <Layout>
        <Home />
      </Layout>
    </div>
  )
}

export default App
