import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

export default function Layout() {
  return (
    <div style={{ minHeight: '100vh', background: '#f4f5f7' }}>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '28px 32px' }}>
        <Outlet />
      </main>
    </div>
  )
}
