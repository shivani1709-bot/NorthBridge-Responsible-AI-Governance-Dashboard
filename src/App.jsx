import React, { Component, useState } from 'react'
import Sidebar from './components/Sidebar'
import Topbar from './components/Topbar'
import Dashboard from './pages/Dashboard'
import SectionPage from './pages/SectionPages'
import { navGroups } from './data/mockData'

const titles = Object.fromEntries(navGroups.flatMap((group) => group.items.map((item) => [item.id, item.label])))

class AppErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <main className="error-screen"><h1>NorthBridge is temporarily unavailable</h1><p>Refresh the educational prototype to restore the dashboard.</p><button className="button button-dark" onClick={() => window.location.reload()}>Refresh dashboard</button></main>
    }
    return this.props.children
  }
}

export default function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const navigate = (page) => { setActivePage(page); setSidebarOpen(false) }
  return <AppErrorBoundary><div className="app-shell"><Sidebar activePage={activePage} onNavigate={navigate} open={sidebarOpen} onClose={() => setSidebarOpen(false)} onNotice={setNotice} /><div className="main-shell"><Topbar title={titles[activePage]} onMenu={() => setSidebarOpen(true)} onNotice={setNotice} /><main>{notice && <div className="global-notice" role="status">{notice}<button aria-label="Dismiss notice" onClick={() => setNotice('')}>×</button></div>}{activePage === 'dashboard' ? <Dashboard onNavigate={navigate} /> : <SectionPage page={activePage} />}</main><footer className="app-footer"><span>NorthBridge Responsible AI Office</span><span>Mock data for educational use · Last refreshed 03 Sep 2026</span></footer></div>{sidebarOpen && <button className="sidebar-overlay" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}</div></AppErrorBoundary>
}
