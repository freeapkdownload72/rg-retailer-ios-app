import React from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Error Boundary — prevents white screen crash on iOS by catching render errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('RG Retailer App Crash Caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return React.createElement('div', {
        style: {
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          height: '100vh', width: '100vw', background: 'linear-gradient(180deg, #fff7ed 0%, #ffffff 100%)',
          fontFamily: "'Outfit', 'Inter', sans-serif", padding: '32px', boxSizing: 'border-box',
          textAlign: 'center', gap: '16px'
        }
      },
        React.createElement('div', {
          style: {
            width: '72px', height: '72px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #ff6b35, #f97316)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '32px', fontWeight: 800, marginBottom: '8px',
            boxShadow: '0 8px 24px rgba(249,115,22,0.25)'
          }
        }, 'RG'),
        React.createElement('h2', {
          style: { fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: 0 }
        }, 'Something went wrong'),
        React.createElement('p', {
          style: { fontSize: '15px', color: '#64748b', lineHeight: '1.5', margin: 0, maxWidth: '320px' }
        }, 'The app encountered an unexpected error. Please reload to continue shopping.'),
        React.createElement('button', {
          onClick: () => window.location.reload(),
          style: {
            marginTop: '12px', padding: '14px 40px', fontSize: '16px', fontWeight: 700,
            borderRadius: '14px', border: 'none', background: '#ff6b35', color: '#fff',
            cursor: 'pointer', boxShadow: '0 6px 16px rgba(255,107,53,0.3)',
            transition: 'transform 0.2s ease'
          }
        }, 'Reload App')
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)

