import React from 'react'
import ReactDOM from 'react-dom/client'
import './api.js' // Cliente de API Web (Reemplaza a Electron IPC)
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
