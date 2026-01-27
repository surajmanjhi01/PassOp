import React from 'react'
import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import Navbar from './Components/Navbar.jsx'
import './App.css'
import Manager from './Components/Manager.jsx'
import Footer from './Components/Fotter.jsx'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Navbar />
      <div className='min-h-[87vh]'>
      <Manager/>
      </div>
      <Footer />
    </>
  )
}

export default App
