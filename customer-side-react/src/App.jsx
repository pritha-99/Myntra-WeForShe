import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import StorefrontPage from './pages/StorefrontPage'

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/storefront/:sellerId" element={<StorefrontPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App