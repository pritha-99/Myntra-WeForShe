import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import StateDetailPage from './pages/StateDetailPage'
import StorefrontPage from './pages/StorefrontPage'
import ProductDetailPage from './pages/ProductDetailPage'

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/state/:stateName" element={<StateDetailPage />} />
          <Route path="/storefront/:sellerId" element={<StorefrontPage />} />
          <Route path="/product/:productId" element={<ProductDetailPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}


export default App