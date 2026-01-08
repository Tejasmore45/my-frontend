import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { DeployPage } from './pages/DeployPage'
import { DeploymentStatusPage } from './pages/DeploymentStatusPage'
import { ProjectsPage } from './pages/ProjectsPage'

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Navigate to="/projects" replace />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/deploy" element={<DeployPage />} />
        <Route path="/deployments/:deploymentId" element={<DeploymentStatusPage />} />
        <Route path="*" element={<Navigate to="/projects" replace />} />
      </Routes>
    </AppShell>
  )
}
