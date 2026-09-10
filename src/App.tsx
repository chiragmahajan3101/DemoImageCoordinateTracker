import { useState } from 'react'
import './App.css'
import { Routes, Route } from 'react-router-dom'
import CoordinateTracker from './pages/CoordinateTracker/trackerUsingBSP'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      {/* <section id="center">
        <div>
          <h1>Get started</h1>
          <p>
            Edit <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
      </section> */}
      <Routes>
        <Route path="/" element={<CoordinateTracker />} />
      </Routes>
    </>
  )
}

export default App
