import { useState, useEffect } from 'react'
import createTuner from '@pedroloch/tuner'
import useMicrophoneVolume from "react-use-microphone-volume-hook"
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

const tuner = createTuner()

tuner.start()

function App() {
  const [count, setCount] = useState(0)
  const [isListening, setIsListening] = useState(false)
  const [volume, { startTrackingMicrophoneVolume, stopTrackingMicrophoneVolume }] = useMicrophoneVolume({ autoStart: true })

  tuner.getData((data) => {
    console.log(data) // => {frequency: 220.47996157982865, pitch: 220, note: "A", diff: 7}
  })


  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more (Volume {volume})
      </p>
    </>
  )
}

export default App
