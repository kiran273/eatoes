import React, { useState } from 'react'
import { MenuProvider }    from './context/MenuContext.jsx'
import Sidebar             from './components/Sidebar.jsx'
import Navbar              from './components/Navbar.jsx'
import Dashboard           from './pages/Dashboard.jsx'
import MenuManagement      from './pages/MenuManagement.jsx'
import Orders              from './pages/Orders.jsx'
import Analytics           from './pages/Analytics.jsx'

const pages = {
  dashboard: Dashboard,
  menu:      MenuManagement,
  orders:    Orders,
  analytics: Analytics
}

export default function App() {
  const [activePage, setActivePage] = useState('dashboard')
  const Page = pages[activePage] || Dashboard

  return (
    <MenuProvider>
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar activePage={activePage} onNavigate={setActivePage} />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Navbar activePage={activePage} />
          <Page />
        </div>
      </div>
    </MenuProvider>
  )
}
