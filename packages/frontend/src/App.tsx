import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'

import ProfileSetupPage from './pages/ProfileSetupPage'
import RecommendationPage from './pages/RecommendationPage'
import SearchPage from './pages/SearchPage'
import ClubDetailPage from './pages/ClubDetailPage'
import MyApplicationsPage from './pages/MyApplicationsPage'
import NotificationsPage from './pages/NotificationsPage'

import AdminClubsPage from './pages/admin/AdminClubsPage'
import ClubFormPage from './pages/admin/ClubFormPage'
import ApplicationReviewPage from './pages/admin/ApplicationReviewPage'
import StatsDashboardPage from './pages/admin/StatsDashboardPage'

function Home() {
  const { user, ready } = useAuth()
  if (!ready) return <div style={{ textAlign: 'center', padding: 80, color: '#999' }}>加载中...</div>
  if (user?.role === 'club_admin') return <Navigate to="/admin/clubs" replace />
  return <RecommendationPage />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/clubs/:id" element={<ClubDetailPage />} />
            <Route path="/profile/setup" element={<ProfileSetupPage />} />
            <Route path="/applications" element={<MyApplicationsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />

            <Route path="/admin/clubs" element={<AdminClubsPage />} />
            <Route path="/admin/clubs/new" element={<ClubFormPage />} />
            <Route path="/admin/clubs/:id/edit" element={<ClubFormPage />} />
            <Route path="/admin/clubs/:clubId/applications" element={<ApplicationReviewPage />} />
            <Route path="/admin/clubs/:clubId/stats" element={<StatsDashboardPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
