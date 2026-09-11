import './App.css'
import { Routes, Route } from 'react-router-dom'
import CoordinateTracker from './pages/CoordinateTracker/trackerUsingBSP'
import CoordinateTracker2 from './pages/CoordinateTracker/trackerUsingMTN'

function App() {

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
        <Route path="/mt" element={<CoordinateTracker2 />} />
      </Routes>
    </>
  )
}

export default App
